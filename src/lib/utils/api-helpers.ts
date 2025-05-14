/**
 * Interface for tribute data
 */
export interface TributeData {
  title: string;
  slug: string;
  custom_html?: string | null;
  user_name: string;
  user_email: string;
  user_phone: string;
  memorial_date?: string;
  memorial_location?: string;
}

/**
 * Saves a tribute to the API
 *
 * @param tributeData - The tribute data to save
 * @param token - Authentication token
 * @returns Promise with the API response
 */
export async function saveTribute(tributeData: TributeData, token?: string): Promise<any> {
  // In a real application, this would make an actual API call
  // For now, we'll simulate a successful API response
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Log the tribute data for debugging
  console.log('Saving tribute:', tributeData);
  
  // Return a simulated successful response
  return {
    success: true,
    data: {
      id: `tribute-${Date.now()}`,
      ...tributeData,
      created_at: new Date().toISOString()
    }
  };
}

/**
 * Searches for tributes by name
 * 
 * @param searchTerm - The search term to use
 * @param page - Page number for pagination
 * @returns Promise with search results
 */
export async function searchTributes(searchTerm: string, page = 1): Promise<any> {
  // In a real application, this would query a database
  // For now, we'll simulate some search results
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulated search results - in a real app, these would come from a database
  const mockTributes: TributeData[] = [
    { 
      title: "John Smith", 
      slug: "john-smith",
      user_name: "Sarah Smith",
      user_email: "sarah@example.com",
      user_phone: "555-123-4567"
    },
    { 
      title: "Sarah Johnson", 
      slug: "sarah-johnson",
      user_name: "Michael Johnson",
      user_email: "michael@example.com",
      user_phone: "555-987-6543"
    },
    { 
      title: "David Williams", 
      slug: "david-williams",
      user_name: "Jennifer Williams",
      user_email: "jennifer@example.com",
      user_phone: "555-567-8901"
    }
  ];
  
  // Filter tributes based on the search term
  const searchTermLower = searchTerm.toLowerCase();
  const filteredTributes = mockTributes.filter(tribute => 
    tribute.title.toLowerCase().includes(searchTermLower) ||
    tribute.slug.includes(searchTermLower)
  );
  
  return {
    success: true,
    data: {
      tributes: filteredTributes,
      total: filteredTributes.length,
      page,
      searchTerm
    }
  };
}

/**
 * Registers or logs in a user and returns a JWT token
 * 
 * @param email - User's email
 * @param name - User's name
 * @param phoneNumber - User's phone number
 * @returns Promise with the authentication token
 */
export async function authenticateUser(email: string, name: string, phoneNumber: string): Promise<string> {
  // In a real application, this would register the user or log them in
  // For now, we'll simulate a successful login with a fake JWT
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a random token (this is just for simulation - not a real JWT)
  const token = `simulated-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  return token;
}