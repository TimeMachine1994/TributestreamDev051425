import { json } from '@sveltejs/kit';
import { getTributeById, updateTribute } from '$lib/server/strapi/tribute';
import { canEditTribute } from '$lib/utils/tribute-permissions';
import type { RequestHandler } from './$types';
import type { Tribute } from '$lib/types/tribute';

/**
 * Interface for tribute update data
 */
interface TributeUpdateData {
  name?: string;
  description?: string;
}

/**
 * Convert Strapi response to TributeData format
 * This adapter ensures the data structure matches what canEditTribute expects
 */
function adaptTributeForPermissionCheck(tribute: any) {
  if (!tribute) return null;
  
  return {
    id: tribute.id,
    attributes: {
      owner: {
        data: tribute.attributes?.owner?.data || null
      }
    }
  };
}

/**
 * PUT handler for updating tribute information
 * Only allows updating name and description fields
 */
export const PUT: RequestHandler = async (event) => {
  console.log('🔄 PUT tribute/[id] endpoint called');
  const { params, locals } = event;
  const tributeId = params.id;
  
  console.log(`🔍 Processing tribute update request for ID: ${tributeId} (type: ${typeof tributeId})`);
  
  try {
    // Check authentication
    if (!locals.user) {
      console.log('❌ Unauthorized: No user authenticated');
      return json({ error: 'Unauthorized: You must be logged in to update a tribute' }, { status: 401 });
    }

    // Get the tribute
    console.log(`🔍 Fetching tribute with ID: ${tributeId} (type: ${typeof tributeId})`);
    const tribute = await getTributeById(tributeId, event);
    
    if (!tribute) {
      console.log(`❌ Tribute not found with ID: ${tributeId}`);
      return json({
        error: 'Tribute not found',
        message: `Unable to find a tribute with ID: ${tributeId}. The tribute may have been deleted or you may have invalid data.`
      }, { status: 404 });
    }
    
    console.log(`✅ Successfully retrieved tribute: ${tributeId}`);

    // Check permissions
    // Convert tribute to the format expected by canEditTribute
    const tributeForPermissionCheck = adaptTributeForPermissionCheck(tribute);
    
    if (!canEditTribute(locals.user, tributeForPermissionCheck)) {
      console.log(`🚫 Permission denied: User ${locals.user.id} cannot edit tribute ${tributeId}`);
      return json({ error: 'Forbidden: You do not have permission to edit this tribute' }, { status: 403 });
    }

    // Parse and validate request body
    const rawRequestBody = await event.request.json();
    console.log(`📦 Received raw update data:`, rawRequestBody);
    
    // Extract data property if it exists (for AdminPortal.svelte compatibility)
    const requestBody: TributeUpdateData = rawRequestBody.data || rawRequestBody;
    console.log(`📦 Processed request data:`, requestBody);
    
    // Extract only allowed fields (name and description)
    const updateData: TributeUpdateData = {};
    
    // Validate name if provided
    if (requestBody.name !== undefined) {
      if (typeof requestBody.name !== 'string' || requestBody.name.length < 2) {
        return json({ error: 'Name must be at least 2 characters long' }, { status: 400 });
      }
      updateData.name = requestBody.name;
    }
    
    // Validate description if provided
    if (requestBody.description !== undefined) {
      if (typeof requestBody.description !== 'string') {
        return json({ error: 'Description must be a string' }, { status: 400 });
      }
      
      if (requestBody.description.length > 0 && requestBody.description.length < 10) {
        return json({ error: 'Description must be at least 10 characters long if provided' }, { status: 400 });
      }
      
      if (requestBody.description.length > 1000) {
        return json({ error: 'Description must be less than 1000 characters' }, { status: 400 });
      }
      
      updateData.description = requestBody.description;
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      console.log('⚠️ No valid fields to update');
      return json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    // Update the tribute - when using the Strapi client, we don't need to use the full Tribute structure
    // because the function wraps our data in the correct format for the API
    console.log('🟢 Updating tribute with data:', updateData);
    
    // The updateTribute function expects a partial tribute, but internally wraps it in { data: ... }
    console.log(`⚙️ Sending update to Strapi for tribute ID: ${tributeId} (type: ${typeof tributeId}) with data:`, updateData);
    const updatedTribute = await updateTribute(tributeId, updateData as any, event);
    
    // Return the updated tribute
    console.log('✅ Tribute updated successfully');
    return json({ 
      message: 'Tribute updated successfully',
      tribute: updatedTribute 
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error updating tribute:', error);
    return json({ 
      error: 'Failed to update tribute', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};