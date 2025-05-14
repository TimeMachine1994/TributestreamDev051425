<?php
/**
 * Plugin Name: 01A9 TributeStream Complete
 * Plugin URI:  https://example.com
 * Description: A comprehensive plugin providing custom REST endpoints for tributes, extended data, user registration, and user meta management.
 * Version:     1.0.0
 * Author:      Your Name
 * Author URI:  https://example.com
 * Text Domain: tributestream-complete
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class TributeStreamComplete {

    private $table_name; // e.g. 'wp_tributes'
    private $allowed_origins = array(
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:3000',
        'https://wp.tributestream.com',
        'https://tributestream.com',
    );

    public function __construct() {
        global $wpdb;
        // Determine the table name (honoring WP table prefix).
        $this->table_name = $wpdb->prefix . 'tributes';

        // Create the custom table on plugin activation.
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Hook into REST API init to register our custom routes.
        add_action('rest_api_init', array($this, 'register_routes'));

        // Hook into rest_pre_serve_request to add CORS headers.
        add_action('rest_api_init', array($this, 'handle_cors'));
    }

    /**
     * Create the custom 'tributes' table if it doesn't exist.
     */
    public function activate_plugin() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS `{$this->table_name}` (
            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` BIGINT UNSIGNED NOT NULL,
            `loved_one_name` VARCHAR(255) NOT NULL,
            `slug` VARCHAR(255) NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `custom_html` LONGTEXT NULL,
            `phone_number` VARCHAR(50) NOT NULL,
            `number_of_streams` BIGINT UNSIGNED DEFAULT 0,
            PRIMARY KEY (`id`),
            KEY `slug_index` (`slug`),
            KEY `user_id_index` (`user_id`)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta($sql);
    }

    /**
     * Set CORS headers for specific allowed origins.
     */
    public function handle_cors() {
        add_filter('rest_pre_serve_request', function($value) {
            // Check if the Origin header is one of our allowed origins:
            if (isset($_SERVER['HTTP_ORIGIN'])) {
                $origin = $_SERVER['HTTP_ORIGIN'];
                if (in_array($origin, $this->allowed_origins)) {
                    header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
                    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
                    header('Access-Control-Allow-Credentials: true');
                    header('Access-Control-Allow-Headers: Authorization, Content-Type');
                }
            }
            return $value;
        });
    }

    /**
     * Register all custom REST API routes under namespace 'tributestream/v1'.
     */
    public function register_routes() {
        $namespace = 'tributestream/v1';

        // 1) TRIBUTE ROUTES
        // 1.1) GET /tributes
        register_rest_route($namespace, '/tributes', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tributes'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 1.2) POST /tributes
        register_rest_route($namespace, '/tributes', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_tribute'),
                'permission_callback' => array($this, 'check_jwt_auth'),
            ),
        ));

        // 1.3) GET /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_by_id'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 1.4) PUT /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'PUT',
                'callback' => array($this, 'update_tribute'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 1.5) DELETE /tributes/{id}
        register_rest_route($namespace, '/tributes/(?P<id>\d+)', array(
            array(
                'methods'  => 'DELETE',
                'callback' => array($this, 'delete_tribute'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 1.6) GET /tributes/by-user/{user_id}
        register_rest_route($namespace, '/tributes/by-user/(?P<user_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tributes_by_user'),
                'permission_callback' => array($this, 'check_user_ownership_or_admin'),
            ),
        ));

        // 1.7) GET /tribute/{slug}
        register_rest_route($namespace, '/tribute/(?P<slug>[a-zA-Z0-9-_\s]+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_by_slug'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 2) EXTENDED TRIBUTE DATA ROUTES
        // 2.1) POST /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_or_replace_tribute_data'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 2.2) GET /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_tribute_data'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 2.3) PUT /tribute-data/{tribute_id}
        register_rest_route($namespace, '/tribute-data/(?P<tribute_id>\d+)', array(
            array(
                'methods'  => 'PUT',
                'callback' => array($this, 'update_tribute_data'),
                'permission_callback' => array($this, 'check_tribute_ownership'),
            ),
        ));

        // 3) USER REGISTRATION
        // 3.1) POST /register
        register_rest_route($namespace, '/register', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'register_new_user'),
                'permission_callback' => '__return_true', // public
            ),
        ));

        // 4) USER META ROUTES
        // 4.1) POST /user-meta
        register_rest_route($namespace, '/user-meta', array(
            array(
                'methods'  => 'POST',
                'callback' => array($this, 'create_or_update_user_meta'),
                'permission_callback' => array($this, 'check_user_meta_ownership'),
            ),
        ));

        // 4.2) GET /user-meta/{user_id}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_user_meta_all'),
                'permission_callback' => array($this, 'check_user_ownership_or_admin'),
            ),
        ));

        // 4.3) GET /user-meta/{user_id}/{meta_key}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)/(?P<meta_key>[\w-]+)', array(
            array(
                'methods'  => 'GET',
                'callback' => array($this, 'get_user_meta_single'),
                'permission_callback' => array($this, 'check_user_ownership_or_admin'),
            ),
        ));

        // 4.4) DELETE /user-meta/{user_id}/{meta_key}
        register_rest_route($namespace, '/user-meta/(?P<user_id>\d+)/(?P<meta_key>[\w-]+)', array(
            array(
                'methods'  => 'DELETE',
                'callback' => array($this, 'delete_user_meta_single'),
                'permission_callback' => array($this, 'check_user_ownership_or_admin'),
            ),
        ));
    }

    /*--------------------------------------------------------------------------
     * PERMISSION/CHECK FUNCTIONS
     *------------------------------------------------------------------------*/
    /**
     * Generic check that user is logged in via JWT (non-public routes).
     */
    public function check_jwt_auth() {
        if (is_user_logged_in()) {
            return true;
        }
        return new WP_Error('unauthorized', __('You must be logged in (JWT) to access this route.', 'tributestream-complete'), array('status' => 401));
    }

    /**
     * Checks if current user is admin or the same as {user_id}.
     */
    public function check_user_ownership_or_admin($request) {
        // Must be logged in at least.
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }
        $current_user_id = get_current_user_id();
        $requested_user_id = (int) $request['user_id'];

        if (user_can($current_user_id, 'administrator') || $current_user_id === $requested_user_id) {
            return true;
        }
        return new WP_Error('unauthorized', __('You are not allowed to access this user’s data.', 'tributestream-complete'), array('status' => 403));
    }

    /**
     * Checks if current user is admin or the same user as in POST body for user-meta creation.
     */
    public function check_user_meta_ownership($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }
        $current_user_id = get_current_user_id();
        $body = json_decode($request->get_body(), true);

        if (!isset($body['user_id'])) {
            return new WP_Error('missing_fields', __('Missing required field: user_id', 'tributestream-complete'), array('status' => 400));
        }

        $requested_user_id = (int) $body['user_id'];
        if (user_can($current_user_id, 'administrator') || $current_user_id === $requested_user_id) {
            return true;
        }
        return new WP_Error('unauthorized', __('You are not allowed to modify this user’s meta.', 'tributestream-complete'), array('status' => 403));
    }

    /**
     * Checks if the current user is admin or owner of the tribute.
     */
    public function check_tribute_ownership($request) {
        // Must be logged in at least.
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'tributestream-complete'), array('status' => 401));
        }
        global $wpdb;

        $id_field = isset($request['id']) ? 'id' : 'tribute_id';
        $tribute_id = intval($request[$id_field]);

        $tribute = $wpdb->get_row( $wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $tribute_id) );
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        $current_user_id = get_current_user_id();
        // If user is admin or tribute->user_id matches current user:
        if (user_can($current_user_id, 'administrator') || (int) $tribute->user_id === $current_user_id) {
            return true;
        }

        return new WP_Error('unauthorized', __('You do not have permission to access this tribute.', 'tributestream-complete'), array('status' => 403));
    }

    /*--------------------------------------------------------------------------
     * HELPER: GET TRIBUTE BY ID (internal use)
     *------------------------------------------------------------------------*/
    private function fetch_tribute_by_id($id) {
        global $wpdb;
        return $wpdb->get_row( $wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A );
    }

    private function fetch_tribute_by_slug($slug) {
        global $wpdb;
        return $wpdb->get_row( $wpdb->prepare("SELECT * FROM {$this->table_name} WHERE slug = %s", $slug), ARRAY_A );
    }

    /*--------------------------------------------------------------------------
     * 1) TRIBUTE ENDPOINT CALLBACKS
     *------------------------------------------------------------------------*/

    /**
     * 1.1) GET /tributes
     */
    public function get_tributes($request) {
        global $wpdb;

        $page       = isset($request['page']) ? max(1, intval($request['page'])) : 1;
        $per_page   = isset($request['per_page']) ? max(1, intval($request['per_page'])) : 10;
        $search     = isset($request['search']) ? trim($request['search']) : '';

        $offset = ($page - 1) * $per_page;
        
        // Build WHERE
        $where_clause = 'WHERE 1=1';
        $params = array();
        if (!empty($search)) {
            // Match on loved_one_name or slug
            $search_like = '%' . $wpdb->esc_like($search) . '%';
            $where_clause .= " AND (loved_one_name LIKE %s OR slug LIKE %s)";
            $params[] = $search_like;
            $params[] = $search_like;
        }

        // Count total
        $sql_count = "SELECT COUNT(*) FROM {$this->table_name} $where_clause";
        $total_items = $wpdb->get_var($wpdb->prepare($sql_count, $params));

        // Query tributes
        $sql_data  = "SELECT * FROM {$this->table_name} $where_clause ORDER BY created_at DESC LIMIT %d, %d";
        $params_data = array_merge($params, array($offset, $per_page));
        $results = $wpdb->get_results($wpdb->prepare($sql_data, $params_data), ARRAY_A);

        $total_pages = ceil($total_items / $per_page);

        return array(
            'tributes'      => $results ? $results : array(),
            'total_pages'   => $total_pages,
            'total_items'   => (int) $total_items,
            'current_page'  => (int) $page
        );
    }

    /**
     * 1.2) POST /tributes
     */
    public function create_tribute($request) {
        global $wpdb;
        $body = json_decode($request->get_body(), true);

        // Required fields
        $required_fields = array('user_id', 'loved_one_name', 'phone_number');
        foreach ($required_fields as $field) {
            if (!isset($body[$field]) || empty($body[$field])) {
                return new WP_Error('missing_fields', sprintf(__('Missing required field: %s', 'tributestream-complete'), $field), array('status' => 400));
            }
        }

        // Prepare data
        $user_id = intval($body['user_id']);
        $loved_one_name = sanitize_text_field($body['loved_one_name']);

        $slug = isset($body['slug']) && !empty($body['slug'])
            ? sanitize_title($body['slug'])
            : sanitize_title($loved_one_name);

        $custom_html = isset($body['custom_html']) ? wp_kses_post($body['custom_html']) : '';
        $phone_number = sanitize_text_field($body['phone_number']);
        $number_of_streams = isset($body['number_of_streams']) ? intval($body['number_of_streams']) : 0;

        // Insert tribute
        $inserted = $wpdb->insert($this->table_name, array(
            'user_id' => $user_id,
            'loved_one_name' => $loved_one_name,
            'slug' => $slug,
            'custom_html' => $custom_html,
            'phone_number' => $phone_number,
            'number_of_streams' => $number_of_streams,
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ));

        if ($inserted === false) {
            return new WP_Error('db_insert_error', __('Failed to insert tribute.', 'tributestream-complete'), array('status' => 500));
        }

        $tribute_id = $wpdb->insert_id;

        // If extended_data is provided, store in user meta
        if (isset($body['extended_data'])) {
            $meta_key = 'tributestream_extended_data_' . $tribute_id;
            update_user_meta($user_id, $meta_key, $body['extended_data']);
        }

        return array(
            'success' => true,
            'id'      => $tribute_id,
            'slug'    => $slug
        );
    }

    /**
     * 1.3) GET /tributes/{id}
     */
    public function get_tribute_by_id($request) {
        $id = intval($request['id']);
        $tribute = $this->fetch_tribute_by_id($id);
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }
        return $tribute;
    }

    /**
     * 1.4) PUT /tributes/{id}
     */
    public function update_tribute($request) {
        global $wpdb;
        $id = intval($request['id']);
        $body = json_decode($request->get_body(), true);

        // Filter updatable fields
        $fields = array('loved_one_name', 'slug', 'custom_html', 'phone_number', 'number_of_streams');
        $data = array();
        foreach ($fields as $f) {
            if (isset($body[$f])) {
                switch ($f) {
                    case 'loved_one_name':
                        $data[$f] = sanitize_text_field($body[$f]);
                        break;
                    case 'slug':
                        $data[$f] = sanitize_title($body[$f]);
                        break;
                    case 'custom_html':
                        $data[$f] = wp_kses_post($body[$f]);
                        break;
                    case 'phone_number':
                        $data[$f] = sanitize_text_field($body[$f]);
                        break;
                    case 'number_of_streams':
                        $data[$f] = intval($body[$f]);
                        break;
                }
            }
        }

        if (empty($data)) {
            return new WP_Error('no_update', __('No valid fields to update.', 'tributestream-complete'), array('status' => 400));
        }

        $data['updated_at'] = current_time('mysql');

        $updated = $wpdb->update($this->table_name, $data, array('id' => $id));
        if ($updated === false) {
            return new WP_Error('db_update_error', __('Failed to update tribute.', 'tributestream-complete'), array('status' => 500));
        }

        return array('success' => true, 'updated_rows' => $updated);
    }

    /**
     * 1.5) DELETE /tributes/{id}
     */
    public function delete_tribute($request) {
        global $wpdb;
        $id = intval($request['id']);

        $deleted = $wpdb->delete($this->table_name, array('id' => $id));
        if ($deleted === false) {
            return new WP_Error('db_delete_error', __('Failed to delete tribute.', 'tributestream-complete'), array('status' => 500));
        }
        if ($deleted === 0) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        return array('success' => true, 'deleted_rows' => $deleted);
    }

    /**
     * 1.6) GET /tributes/by-user/{user_id}
     */
    public function get_tributes_by_user($request) {
        global $wpdb;
        $user_id = intval($request['user_id']);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE user_id = %d ORDER BY created_at DESC",
            $user_id
        ), ARRAY_A);

        return array(
            'tributes' => $results ? $results : array()
        );
    }

    /**
     * 1.7) GET /tribute/{slug}
     */
    public function get_tribute_by_slug($request) {
        $slug = sanitize_title($request['slug']);
        $tribute = $this->fetch_tribute_by_slug($slug);
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute slug not found.', 'tributestream-complete'), array('status' => 404));
        }
        return $tribute;
    }

    /*--------------------------------------------------------------------------
     * 2) EXTENDED TRIBUTE DATA ENDPOINTS
     *------------------------------------------------------------------------*/

    /**
     * 2.1) POST /tribute-data/{tribute_id} -> create or replace
     */
    public function create_or_replace_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        $body = json_decode($request->get_body(), true);
        if (!is_array($body)) {
            $body = array();
        }

        // Force tribute_reference
        $body['tribute_reference'] = $tribute_id;

        // Find who owns the tribute
        $tribute = $this->fetch_tribute_by_id($tribute_id);
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        // Save in user meta
        $user_id = (int) $tribute['user_id'];
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        update_user_meta($user_id, $meta_key, $body);

        return array(
            'success' => true,
            'message' => __('Extended data stored successfully', 'tributestream-complete'),
        );
    }

    /**
     * 2.2) GET /tribute-data/{tribute_id}
     */
    public function get_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        // Check if tribute exists
        $tribute = $this->fetch_tribute_by_id($tribute_id);
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        $user_id = (int) $tribute['user_id'];
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        $data = get_user_meta($user_id, $meta_key, true);

        return $data ? $data : array();
    }

    /**
     * 2.3) PUT /tribute-data/{tribute_id} -> partial update (merge)
     */
    public function update_tribute_data($request) {
        $tribute_id = intval($request['tribute_id']);
        $body = json_decode($request->get_body(), true);
        if (!is_array($body)) {
            $body = array();
        }

        $tribute = $this->fetch_tribute_by_id($tribute_id);
        if (!$tribute) {
            return new WP_Error('not_found', __('Tribute not found.', 'tributestream-complete'), array('status' => 404));
        }

        $user_id = (int) $tribute['user_id'];
        $meta_key = 'tributestream_extended_data_' . $tribute_id;
        $existing_data = get_user_meta($user_id, $meta_key, true);

        if (!is_array($existing_data)) {
            $existing_data = array();
        }

        // Force tribute_reference
        $existing_data['tribute_reference'] = $tribute_id;

        // Merge new data into existing
        $merged_data = array_replace_recursive($existing_data, $body);

        update_user_meta($user_id, $meta_key, $merged_data);

        return array(
            'success' => true,
            'message' => __('Extended data updated successfully', 'tributestream-complete'),
        );
    }

    /*--------------------------------------------------------------------------
     * 3) USER REGISTRATION
     *------------------------------------------------------------------------*/

    /**
     * 3.1) POST /register
     * Creates a new WordPress user, sets meta, and returns a JWT token.
     */
    public function register_new_user($request) {
        $body = json_decode($request->get_body(), true);

        // Check required fields
        $required_fields = array('username', 'email', 'password');
        foreach ($required_fields as $field) {
            if (empty($body[$field])) {
                return new WP_Error(
                    'missing_fields',
                    sprintf(__('Missing required field: %s', 'tributestream-complete'), $field),
                    array('status' => 400)
                );
            }
        }

        $username = sanitize_user($body['username']);
        $email = sanitize_email($body['email']);
        $password = $body['password'];

        // Check if username or email exists
        if (username_exists($username)) {
            return new WP_Error('username_exists', __('Username already exists.', 'tributestream-complete'), array('status' => 400));
        }
        if (email_exists($email)) {
            return new WP_Error('email_exists', __('Email already exists.', 'tributestream-complete'), array('status' => 400));
        }

        // Create user
        $user_id = wp_create_user($username, $password, $email);
        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // Optionally set extra meta
        if (!empty($body['meta']) && is_array($body['meta'])) {
            foreach ($body['meta'] as $key => $value) {
                update_user_meta($user_id, $key, $value);
            }
        }

        // Now use the JWT Auth plugin to generate a token for the newly created user.
        // Typically you would do a POST to /jwt-auth/v1/token with username/password,
        // but if you want to generate it programmatically:
        // 
        // If you’re using the official WP JWT Auth plugin, you can emulate that:
        $creds = array(
            'user_login'    => $username,
            'user_password' => $password,
        );
        $token_response = $this->generate_jwt_token($creds);
        if (is_wp_error($token_response)) {
            // If for some reason token generation fails, just return user info.
            return array(
                'user_id'           => $user_id,
                'token'             => null,
                'user_display_name' => $username,
                'user_email'        => $email,
            );
        }

        // Return user data + token
        return array(
            'user_id'           => $user_id,
            'token'             => $token_response['token'],
            'user_display_name' => $username,
            'user_email'        => $email,
        );
    }

    /**
     * Attempt to generate JWT token programmatically (if the JWT Auth plugin is installed).
     */
    private function generate_jwt_token($creds) {
        // If the jwt_auth_generate_token function is available:
        if (function_exists('jwt_auth_generate_token')) {
            $user = wp_signon($creds, false);
            if (is_wp_error($user)) {
                return $user; // Return the error.
            }
            // Return token info
            $token = jwt_auth_generate_token($user->ID);
            if (is_wp_error($token)) {
                return $token;
            }
            return array('token' => $token);
        } else {
            // Fallback: you could return an error or do nothing
            return new WP_Error('jwt_auth_missing', __('JWT Auth plugin is not available.', 'tributestream-complete'), array('status' => 500));
        }
    }

    /*--------------------------------------------------------------------------
     * 4) USER META ENDPOINTS
     *------------------------------------------------------------------------*/

    /**
     * 4.1) POST /user-meta
     * Stores or updates a user meta under a given meta_key.
     */
    public function create_or_update_user_meta($request) {
        $body = json_decode($request->get_body(), true);

        $user_id = (int) $body['user_id'];
        $meta_key = isset($body['meta_key']) ? sanitize_key($body['meta_key']) : '';
        $meta_value = isset($body['meta_value']) ? $body['meta_value'] : '';

        if (!$user_id || !$meta_key) {
            return new WP_Error('missing_fields', __('user_id and meta_key are required.', 'tributestream-complete'), array('status' => 400));
        }

        // If meta_value is array/object, store JSON-encoded
        if (is_array($meta_value) || is_object($meta_value)) {
            update_user_meta($user_id, $meta_key, $meta_value);
        } else {
            // store raw
            update_user_meta($user_id, $meta_key, sanitize_text_field($meta_value));
        }

        return array(
            'success' => true,
            'message' => __('User meta updated successfully', 'tributestream-complete'),
        );
    }

    /**
     * 4.2) GET /user-meta/{user_id}
     * Returns all user meta (keys and values).
     */
    public function get_user_meta_all($request) {
        $user_id = intval($request['user_id']);
        $raw_meta = get_user_meta($user_id);

        $processed = array();
        foreach ($raw_meta as $key => $values) {
            // Typically each meta key is an array of values, but usually just 1
            if (count($values) === 1) {
                $value = maybe_unserialize($values[0]);
                // If JSON decode is valid, return as array
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $processed[$key] = $decoded;
                } else {
                    $processed[$key] = $value;
                }
            } else {
                // If multiple meta values exist for the same key
                $arr = array();
                foreach ($values as $v) {
                    $maybe_json = json_decode($v, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($maybe_json)) {
                        $arr[] = $maybe_json;
                    } else {
                        $arr[] = $v;
                    }
                }
                $processed[$key] = $arr;
            }
        }

        return array('meta' => $processed);
    }

    /**
     * 4.3) GET /user-meta/{user_id}/{meta_key}
     * Returns a single meta key for a user (decoded if valid JSON).
     */
    public function get_user_meta_single($request) {
        $user_id = intval($request['user_id']);
        $meta_key = sanitize_key($request['meta_key']);

        $value = get_user_meta($user_id, $meta_key, true);
        if ($value === '') {
            return new WP_Error('meta_not_found', __('Meta key not found or empty.', 'tributestream-complete'), array('status' => 404));
        }

        // Decode if JSON
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $value = $decoded;
        }

        return array(
            'key'   => $meta_key,
            'value' => $value
        );
    }

    /**
     * 4.4) DELETE /user-meta/{user_id}/{meta_key}
     * Removes a single user meta key.
     */
    public function delete_user_meta_single($request) {
        $user_id = intval($request['user_id']);
        $meta_key = sanitize_key($request['meta_key']);

        $deleted = delete_user_meta($user_id, $meta_key);
        if (!$deleted) {
            return new WP_Error('meta_not_found', __('Meta key not found or delete failed.', 'tributestream-complete'), array('status' => 404));
        }

        return array(
            'success' => true,
            'message' => __('User meta deleted successfully', 'tributestream-complete'),
        );
    }
}

// Instantiate the plugin class
new TributeStreamComplete();
