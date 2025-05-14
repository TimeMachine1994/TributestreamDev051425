Documentation for SuperForms

Get started
I'm using

npm
and my validation library is

Zod
npm i -D sveltekit-superforms zod
Select your environment above and run the install command in your project folder.

If you’re starting from scratch, create a new SvelteKit project:

npx sv create my-app
Alternatively, open the tutorial on SvelteLab to follow along in the browser and copy the code from there.

Creating a Superform

This tutorial will create a Superform with a name and email address, ready to be expanded with more form data.

Creating a validation schema

The main thing required to create a Superform is a validation schema, representing the form data for a single form:

import { z } from 'zod';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});
Schema caching

Define the schema outside the load function, on the top level of the module. This is very important to make caching work. The adapter is memoized (cached) with its arguments, so they must be kept in memory.

Therefore, define the schema, its options and potential defaults on the top level of a module, so they always refer to the same object.

Initializing the form in the load function

To initialize the form, you import superValidate and an adapter for your validation library of choice in a load function:

src/routes/+page.server.ts

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

// Define outside the load function so the adapter can be cached
const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = async () => {
  const form = await superValidate(zod(schema));

  // Always return { form } in load functions
  return { form };
};
The Superforms server API is called superValidate. You can call it in two ways in the load function:

Empty form

If you want the form to be initially empty, just pass the adapter as in the example above, and the form will be filled with default values based on the schema. For example, a string field results in an empty string, unless you have specified a default.

Populate form from database

If you want to populate the form, usually from a database, you can send data to superValidate as the first parameter, adapter second, like this:

import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  // Replace with your database
  const user = db.users.findUnique({
    where: { id: params.id }
  });

  if (!user) error(404, 'Not found');

  const form = await superValidate(user, your_adapter(schema));

  // Always return { form } in load functions
  return { form };
};
As long as the data partially matches the schema, you can pass it directly to superValidate. This is useful for backend interfaces, where the form should usually be populated based on a url like /users/123.

Errors will be displayed when the form is populated, but not when empty. You can modify this behavior with an option.

Important note about return values

Unless you call the SvelteKit redirect or error functions, you should always return the form object to the client, either directly or through a helper function. The name of the variable doesn’t matter; you can call it { loginForm } or anything else, but it needs to be returned like this in all code paths that returns, both in load functions and form actions. If you don’t, the form won’t be updated with new data (like errors) on the client.

Posting data

In the form actions, also defined in +page.server.ts, we’ll use superValidate again, but now it should handle FormData. This can be done in several ways:

Use the request parameter (which contains FormData)
Use the event object (which contains the request)
Use FormData directly, if you need to access it before calling superValidate.
The most common is to use request:

src/routes/+page.server.ts

import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, your_adapter(schema));
    console.log(form);

    if (!form.valid) {
      // Return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // Return the form with a status message
    return message(form, 'Form posted successfully!');
  }
};
For simple forms

If you have a very simple form and no intentions to use any client-side functionality like events, loading spinners, nested data, etc, then you don’t have to include the client part, which the rest of the tutorial is about. There’s a short example how to display errors and messages without the client here. Enjoy the simplicity!

Displaying the form

The data from superValidate is now available in +page.svelte as data.form, as we did a return { form }. Now we can use the client part of the API:

src/routes/+page.svelte

<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

  // Client API:
  const { form } = superForm(data.form);
</script>

<form method="POST">
  <label for="name">Name</label>
  <input type="text" name="name" bind:value={$form.name} />

  <label for="email">E-mail</label>
  <input type="email" name="email" bind:value={$form.email} />

  <div><button>Submit</button></div>
</form>
The superForm function is used to create a form on the client, and bind:value is used to create a two-way binding between the form data and the input fields.

Two notes: There should be only one superForm instance per form - its methods cannot be used in multiple forms. And don’t forget the name attribute on the input fields! Unless you are using nested data, they are required.

This is what the form should look like now:

Name 
Hello world!
E-mail 
Submit
Debugging

We can see that the form has been populated with the default values from the schema. But let’s add the debugging component SuperDebug to look behind the scenes:

src/routes/+page.svelte

<script lang="ts">
  import SuperDebug from 'sveltekit-superforms';
</script>

<SuperDebug data={$form} />
This should be displayed:


200
{
  name: "Hello world!",
  email: ""
}
When editing the form fields (try in the form above), the data is automatically updated.

SuperDebug also displays a copy button and the current page status in the right corner. There are many configuration options available.

Posting the form

Now we can post the form back to the server. Submit the form, and see what’s happening on the server:

{
  id: 'a3g9kke',
  valid: false,
  posted: true,
  data: { name: 'Hello world!', email: '' },
  errors: { email: [ 'Invalid email' ] }
}
This is the validation object returned from superValidate, containing the data needed to update the form:

Property	Purpose
id	Id for the schema, to handle multiple forms on the same page.
valid	Tells you whether the validation succeeded or not. Used on the server and in events.
posted	Tells you if the data was posted (in a form action) or not (in a load function).
data	The posted data, which should be returned to the client using fail if not valid.
errors	An object with all validation errors, in a structure reflecting the data.
message	(optional) Can be set as a status message.
There are some other properties as well, only being sent in the load function:

Property	Purpose
constraints	An object with HTML validation constraints, that can be spread on input fields.
shape	Used internally in error handling.
You can modify any of these, and they will be updated on the client when you return { form }. There are a couple of helper functions for making this more convenient, like message and setError.

Displaying errors

Now we know that validation has failed and there are errors being sent to the client. We display these by adding properties to the destructuring assignment of superForm:

src/routes/+page.svelte

<script lang="ts">
  const { form, errors, constraints, message } = superForm(data.form);
  //            ^^^^^^  ^^^^^^^^^^^  ^^^^^^^
</script>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST">
  <label for="name">Name</label>
  <input
    type="text"
    name="name"
    aria-invalid={$errors.name ? 'true' : undefined}
    bind:value={$form.name}
    {...$constraints.name} />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <label for="email">E-mail</label>
  <input
    type="email"
    name="email"
    aria-invalid={$errors.email ? 'true' : undefined}
    bind:value={$form.email}
    {...$constraints.email} />
  {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

  <div><button>Submit</button></div>
</form>

<style>
  .invalid {
    color: red;
  }
</style>
By including the errors store, we can display errors where appropriate, and through constraints we’ll get browser validation even without JavaScript enabled.

The aria-invalid attribute is used to automatically focus on the first error field. And finally, we included the status message above the form to show if it was posted successfully.

We now have a fully working form, with convenient handling of data and validation both on the client and server!

There are no hidden DOM manipulations or other secrets; it’s just HTML attributes and Svelte stores, which means it works perfectly with server-side rendering. No JavaScript is required for the basics.

Adding progressive enhancement

As a last step, let’s add progressive enhancement, so JavaScript users will have a nicer experience. We also need it for enabling client-side validation and events, and of course to avoid reloading the page when the form is posted.

This is simply done with enhance, returned from superForm:

<script lang="ts">
  const { form, errors, constraints, message, enhance } = superForm(data.form);
  //                                          ^^^^^^^
</script>

<!-- Add to the form element: -->
<form method="POST" use:enhance>
Now the page won’t fully reload when submitting, and we unlock lots of client-side features like timers for loading spinners, auto error focus, tainted fields, etc, which you can read about under the Concepts section in the navigation.

The use:enhance action takes no arguments; instead, events are used to hook into the SvelteKit use:enhance parameters and more. Check out the events page for details.

Next steps

This concludes the tutorial! To learn the details, keep reading under the Concepts section in the navigation. A status message is very common to add, for example. Also, if you plan to use nested data (objects and arrays within the schema), read the nested data page carefully. The same goes for having multiple forms on the same page.

When you’re ready for something more advanced, check out the CRUD tutorial, which shows how to make a fully working backend in about 150 lines of code.

Enjoy your Superforms!

Multiple forms on the same page
Since there is only one $page store per route, multiple forms on the same page, like a register and login form, can cause problems since both form actions will update $page.form, possibly affecting the other form.

With Superforms, multiple forms on the same page are handled automatically if you are using use:enhance, and the forms have different schema types. When using the same schema for multiple forms, you need to set the id option:

const form = await superValidate(zod(schema), {
  id: string | undefined
});
By setting an id on the server, you’ll ensure that only forms with the matching id on the client will react to the updates.

“Different schema types” means “different fields and types”, so just copying a schema and giving it a different variable name will still count as the same schema. The contents of the schemas have to differ.

Here’s an example of how to handle a login and registration form on the same page:

+page.server.ts

import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
});

export const load: PageServerLoad = async () => {
  // Different schemas, no id required.
  const loginForm = await superValidate(zod(loginSchema));
  const registerForm = await superValidate(zod(registerSchema));

  // Return them both
  return { loginForm, registerForm };
};

export const actions = {
  login: async ({ request }) => {
    const loginForm = await superValidate(request, zod(loginSchema));

    if (!loginForm.valid) return fail(400, { loginForm });

    // TODO: Login user
    return message(loginForm, 'Login form submitted');
  },

  register: async ({ request }) => {
    const registerForm = await superValidate(request, zod(registerSchema));

    if (!registerForm.valid) return fail(400, { registerForm });

    // TODO: Register user
    return message(registerForm, 'Register form submitted');
  }
} satisfies Actions;
The code above uses named form actions to determine which form was posted. On the client, you’ll post to these different form actions for the respective form:

+page.svelte

<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';

  let { data } = $props();

  const { form, errors, enhance, message } = superForm(data.loginForm, {
    resetForm: true
  });

  const {
    form: registerForm,
    errors: registerErrors,
    enhance: registerEnhance,
    message: registerMessage
  } = superForm(data.registerForm, {
    resetForm: true
  });
</script>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" action="?/login" use:enhance>
  E-mail: <input name="email" type="email" bind:value={$form.email} />
  Password:
  <input name="password" type="password" bind:value={$form.password} />
  <button>Submit</button>
</form>

<hr />

{#if $registerMessage}<h3>{$registerMessage}</h3>{/if}

<form method="POST" action="?/register" use:registerEnhance>
  E-mail: <input name="email" type="email" bind:value={$registerForm.email} />
  Password:
  <input name="password" type="password" bind:value={$registerForm.password} />
  Confirm password:
  <input
    name="confirmPassword"
    type="password"
    bind:value={$registerForm.confirmPassword} />
  <button>Submit</button>
</form>
Note that there is a separate use:enhance for each form - you cannot share the enhance action between forms.

The above works well with forms that posts to a dedicated form action. But for more dynamic scenarios, let’s say a database table where rows can be edited, the form id should correspond to the row id, and you’d want to communicate to the server which id was sent. This can be done by modifying the $formId store, to let the server know what id was posted, and what it should respond with.

Setting id on the client

On the client, the id is picked up automatically when you pass data.form to superForm, so in general, you don’t have to add it on the client.

// Default behavior: The id is sent along with the form data
// sent from the load function.
const { form, enhance, formId } = superForm(data.loginForm);

// In advanced cases, you can set the id as an option
// and it will take precedence.
const { form, enhance, formId } = superForm(data.form, {
  id: 'custom-id'
});
You can also change the id dynamically with the $formId store, or set it directly in the form with the following method:

Without use:enhance

Multiple forms also work without use:enhance, though in this case you must add a hidden form field called __superform_id with the $formId value:

<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  
  let { data } = $props();

  const { form, errors, formId } = superForm(data.form);
</script>

<form method="POST" action="?/login">
  <input type="hidden" name="__superform_id" bind:value={$formId} />
</form>
This is also required if you’re changing schemas in a form action, as can happen in multi-step forms.

Returning multiple forms

If you have a use case where the data in one form should update another, you can return both forms in the form action: return { loginForm, registerForm }, but be aware that you may need resetForm: false on the second form, as it will reset and clear the updated changes, if it’s valid and a successful response is returned.

Hidden forms

Sometimes you want a fetch function for a form field or a list of items, for example checking if a username is valid while entering it, or deleting rows in a list of data. Instead of doing this manually with fetch, which cannot take advantage of Superforms’ loading timers, events and other functionality, you can create a hidden form that does most of the work, with the convenience you get from superForm:

// First the visible form
const { form, errors, ... } = superForm(...);

// The the hidden form
const { submitting, submit } = superForm(
  { username: '' },
  {
    invalidateAll: false,
    applyAction: false,
    multipleSubmits: 'abort',
    onSubmit({ cancel, formData }) {
      // Using the visible form data
      if (!$form.username) cancel();
      formData.set('username', $form.username);
    },
    onUpdated({ form }) {
      // Update the other form to show the error message
      $errors.username = form.errors.username;
    }
  }
);

const checkUsername = debounce(300, submit);
Create a form action for it:

const usernameSchema = fullSchema.pick({ username: true });

export const actions: Actions = {
  check: async ({ request }) => {
    const form = await superValidate(request, zod(usernameSchema));

    if (!form.valid) return fail(400, { form });
    
    if(!checkUsername(form.data.username)) {
      setError(form, 'username', 'Username is already taken.');
    }

    return { form };
  }
};
And finally, an on:input event on the input field:

<input
  name="username"
  aria-invalid={$errors.username ? 'true' : undefined}
  bind:value={$form.username}
  on:input={checkUsername}
/>
{#if $submitting}<img src={spinner} alt="Checking availability" />
{:else if $errors.username}<div class="invalid">{$errors.username}</div>{/if}
A full example of a username check is available on SvelteLab.

Configuration and troubleshooting

Due to the many different use cases, it’s hard to set sensible default options for multiple forms. A common issue is that when one form is submitted, the other forms’ data are lost. This is due to the page being invalidated by default on a successful response.

If you want to preserve their data, you’d almost certainly want to set invalidateAll: false or applyAction: false on them, as in the example above. The use:enhance option explains the differences between them.

Also check out the componentization page for ideas on how to place the forms into separate components, to make +page.svelte less cluttered.

Forms and fields in components
Looking at the rather simple get started tutorial, it’s obvious that quite a bit of boilerplate code adds up for a Superform:

<!-- For each form field -->
<label for="name">Name</label>
<input
  type="text"
  name="name"
  aria-invalid={$errors.name ? 'true' : undefined}
  bind:value={$form.name}
  {...$constraints.name} 
/>
{#if $errors.name}
  <span class="invalid">{$errors.name}</span>
{/if}
And it also gets bad in the script part when you have more than a couple of forms on the page:

<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  let { data } = $props();

  const {
    form: loginForm,
    errors: loginErrors,
    enhance: loginEnhance,
    //...
  } = superForm(data.loginForm);

  const {
    form: registerForm,
    errors: registerErrors,
    enhance: registerEnhance,
    // ...
  } = superForm(data.registerForm);
</script>
This leads to the question of whether a form and its fields can be factored out into components?

Factoring out a form

To do this, you need the type of the schema, which can be defined as follows:

src/lib/schemas.ts

export const loginSchema = z.object({
  email: z.string().email(),
  password: // ...
});

export type LoginSchema = typeof loginSchema;
Now you can import and use this type in a separate component:

src/routes/LoginForm.svelte

<script lang="ts">
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms'
  import type { LoginSchema } from '$lib/schemas';

  let { data } : { data : SuperValidated<Infer<LoginSchema>> } = $props();

  const { form, errors, enhance } = superForm(data);
</script>

<form method="POST" use:enhance>
  <!-- Business as usual -->
</form>
SuperValidated is the return type from superValidate, which we called in the load function.

This component can now be passed the SuperValidated form data (from the PageData we returned from +page.server.ts), making the page much less cluttered:

+page.svelte

<script lang="ts">
  let { data } = $props();
</script>

<LoginForm data={data.loginForm} />
<RegisterForm data={data.registerForm} />
If your schema input and output types differ, or you have a strongly typed status message, you can add two additional type parameters:

<script lang="ts">
  import type { SuperValidated, Infer, InferIn } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms'
  import type { LoginSchema } from '$lib/schemas';

  let { data } : { 
    data : SuperValidated<Infer<LoginSchema>, { status: number, text: string }, InferIn<LoginSchema>> 
  } = $props();

  const { form, errors, enhance, message } = superForm(data);
</script>

{#if $message.text}
  ...
{/if}

<form method="POST" use:enhance>
  <!-- Business as usual -->
</form>
Factoring out form fields

Since bind is available on Svelte components, we can make a TextInput component quite easily:

TextInput.svelte

<script lang="ts">
  import type { InputConstraint } from 'sveltekit-superforms';

  let { 
    name, 
    value = $bindable(), 
    type = "text", 
    label, 
    errors, 
    constraints, 
    ...rest 
  } : {
    name: string;
    value: string;
    type?: string;
    label?: string;
    errors?: string[];
    constraints?: InputConstraint;
  } = $props();
</script>

<label>
  {#if label}<span>{label}</span><br />{/if}
  <input
    {name}
    {type}
    bind:value
    aria-invalid={errors ? 'true' : undefined}
    {...constraints}
    {...rest} 
  />
</label>
{#if errors}<span class="invalid">{errors}</span>{/if}
+page.svelte

<form method="POST" use:enhance>
  <TextInput
    name="name"
    label="name"
    bind:value={$form.name}
    errors={$errors.name}
    constraints={$constraints.name} 
  />

  <h4>Tags</h4>

  {#each $form.tags as _, i}
    <TextInput
      name="tags"
      label="Name"
      bind:value={$form.tags[i].name}
      errors={$errors.tags?.[i]?.name}
      constraints={$constraints.tags?.name} 
    />
  {/each}
</form>
(Note that you must bind directly to $form.tags with the index, you cannot use the each loop variable, hence the underscore.)

This is a bit better and will certainly help when the components require some styling, but there are still plenty of attributes. Can we do even better?

Things will get a bit advanced from here, so an alternative is to use the Formsnap library, which simplifies componentization a lot.

Using a fieldProxy

You may have seen proxy objects being used for converting an input field string like "2023-04-12" into a Date, but that’s a special usage of proxies. They can actually be used for any part of the form data, to have a store that can modify a part of the $form store. If you want to update just $form.name, for example:

<script lang="ts">
  import { superForm, fieldProxy } from 'sveltekit-superforms/client';

  let { data } = $props();

  const { form } = superForm(data.form);
  const name = fieldProxy(form, 'name');
</script>

<div>Name: {$name}</div>
<button on:click={() => ($name = '')}>Clear name</button>
Any updates to $name will reflect in $form.name, and vice versa. Note that this will also taint that field, so if this is not intended, you can use the whole superForm object and add an option:

const superform = superForm(data.form);
const { form } = superform;

const name = fieldProxy(superform, 'name', { taint: false });
A fieldProxy isn’t enough here, however. We’d still have to make proxies for form, errors, and constraints, resulting in the same problem again.

Using a formFieldProxy

The solution is to use a formFieldProxy, which is a helper function for producing the above proxies from a form. To do this, we cannot immediately deconstruct what we need from superForm, since formFieldProxy takes the form itself as an argument:

<script lang="ts">
  import type { PageData } from './$types.js';
  import { superForm, formFieldProxy } from 'sveltekit-superforms/client';

  let { data } : { data: PageData } = $props();

  const superform = superForm(data.form);

  const { path, value, errors, constraints } = formFieldProxy(superform, 'name');
</script>
But we didn’t want to pass all those proxies, so let’s imagine a component that will handle even the above proxy creation for us.

A typesafe, generic component

<TextField {superform} field="name" />
How nice would this be? This can actually be pulled off in a typesafe way with a bit of Svelte magic:

<script lang="ts" context="module">
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { formFieldProxy, type SuperForm, type FormPathLeaves  } from 'sveltekit-superforms';

  let { superForm, field } : { superform: SuperForm<T>, field: FormPathLeaves<T> } = $props();

  const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

<label>
  {field}<br />
  <input
    name={field}
    type="text"
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps} />
</label>
{#if $errors}<span class="invalid">{$errors}</span>{/if}
The Svelte syntax requires Record<string, unknown> to be defined before its used in the generics attribute, so we have to import it in a module context. Now when T is defined (the schema object type), we can use it in the form prop to ensure that only a SuperForm matching the field prop is used.

The FormPathLeaves type prevents using a field that isn’t at the end of the schema (the “leaves” of the schema tree). This means that arrays and objects cannot be used in formFieldProxy. Array-level errors are handled like this.

Type narrowing for paths

Checkboxes don’t bind with bind:value but with bind:checked, which requires a boolean.

Because our component is generic, value returned from formFieldProxy is unknown, but we need a boolean here. Then we can add a type parameter to FormPathLeaves to narrow it down to a specific type, and use the satisfies operator to specify the type:

<script lang="ts" context="module">
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { 
    formFieldProxy, type FormFieldProxy,
    type SuperForm, type FormPathLeaves
  } from 'sveltekit-superforms';

  let { superForm, field, ...rest } : { superform: SuperForm<T>, field: FormPathLeaves<T, boolean> } = $props();

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<boolean>;
</script>

<input
  name={field}
  type="checkbox"
  class="checkbox"
  bind:checked={$value}
  {...$constraints}
  {...rest} 
/>
This will also narrow the field prop, so only boolean fields in the schema can be selected when using the component.

Checkboxes, especially grouped ones, can be tricky to handle. Read the Svelte tutorial about bind:group, and see the Ice cream example on Stackblitz if you’re having trouble with it.

Using the componentized field in awesome ways

Using this component is now as simple as:

<TextField {superform} field="name" />
But to show off some super proxy power, let’s recreate the tags example above with the TextField component:

<form method="POST" use:enhance>
  <TextField name="name" {superform} field="name" />

  <h4>Tags</h4>

  {#each $form.tags as _, i}
    <TextField name="tags" {superform} field="tags[{i}].name" />
  {/each}
</form>
We can now produce a type-safe text field for any object inside our data, which will update the $form store, and to add new tags, just append a tag object to the tags array:

$form.tags = [...$form.tags, { id: undefined, name: '' }];
In general, nested data requires the dataType option to be set to 'json', except arrays of primitive values, which are coerced automatically.

I hope you now feel under your fingers the superpowers that Superforms bring! 💥