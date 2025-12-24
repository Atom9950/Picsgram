import { supabase } from "../lib/supabase";

// Create a new profile access request
export const createAccessRequest = async (senderId, receiverId) => {
    try {
        // Check if request already exists
        const { data: existingRequest } = await supabase
            .from('profile_access_requests')
            .select('id')
            .eq('senderid', senderId)
            .eq('receiverid', receiverId)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            return { success: false, msg: 'Request already pending' };
        }

        const { data, error } = await supabase
            .from('profile_access_requests')
            .insert({
                senderid: senderId,
                receiverid: receiverId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.log('createAccessRequest error:', error);
        return { success: false, msg: error.message };
    }
};

// Get pending access requests for a user (received requests)
export const getAccessRequests = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profile_access_requests')
            .select(`
                *,
                sender: senderid(id, name, image)
            `)
            .eq('receiverid', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.log('getAccessRequests error:', error);
        return { success: false, msg: error.message };
    }
};

// Get sent access requests (requests sent by a user)
export const getSentAccessRequests = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profile_access_requests')
            .select(`
                *,
                receiver: receiverid(id, name, image)
            `)
            .eq('senderid', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.log('getSentAccessRequests error:', error);
        return { success: false, msg: error.message };
    }
};

// Accept an access request
export const acceptAccessRequest = async (requestId, senderId, receiverId) => {
    try {
        // Delete any existing grant (old or used ones)
        await supabase
            .from('profile_access_grants')
            .delete()
            .eq('grantedby', receiverId)
            .eq('grantedto', senderId);

        // Create access grant - expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        console.log('Creating grant with expiresat:', {
            now: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
        });

        const { data, error } = await supabase
            .from('profile_access_grants')
            .insert({
                grantedby: receiverId,
                grantedto: senderId,
                expiresat: expiresAt.toISOString()
            })
            .select()
            .single();

        if (error) {
            return { success: false, msg: error.message };
        }

        // Delete the request after grant is created (allows new requests)
        await supabase
            .from('profile_access_requests')
            .delete()
            .eq('id', requestId);

        // Return both the grant data and senderId for notification creation
        return { success: true, data, senderId };
    } catch (error) {
        console.log('acceptAccessRequest error:', error);
        return { success: false, msg: error.message };
    }
};

// Reject an access request
export const rejectAccessRequest = async (requestId) => {
    try {
        const { error } = await supabase
            .from('profile_access_requests')
            .delete()
            .eq('id', requestId);

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true };
    } catch (error) {
        console.log('rejectAccessRequest error:', error);
        return { success: false, msg: error.message };
    }
};

// Check if profile access is valid and not expired
export const checkProfileAccess = async (grantedTo, grantedBy) => {
    try {
        const { data, error } = await supabase
            .from('profile_access_grants')
            .select('*')
            .eq('grantedto', grantedTo)
            .eq('grantedby', grantedBy)
            .maybeSingle();

        if (error) {
            return { success: false, hasAccess: false };
        }

        if (!data) {
            return { success: true, hasAccess: false };
        }

        // Check if already used
        if (data.isused) {
            return { success: true, hasAccess: false, isUsed: true };
        }

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(data.expiresat);

        console.log('Expiration check:', {
            now: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            isExpired: now > expiresAt,
            diffMs: expiresAt.getTime() - now.getTime(),
            diffMins: (expiresAt.getTime() - now.getTime()) / 60000
        });

        if (now > expiresAt) {
            return { success: true, hasAccess: false, isExpired: true };
        }

        return { success: true, hasAccess: true, data };
    } catch (error) {
        console.log('checkProfileAccess error:', error);
        return { success: false, hasAccess: false };
    }
};

// Mark access as used
export const useProfileAccess = async (grantId) => {
    try {
        const { error } = await supabase
            .from('profile_access_grants')
            .update({
                isused: true,
                usedat: new Date().toISOString()
            })
            .eq('id', grantId);

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true };
    } catch (error) {
        console.log('useProfileAccess error:', error);
        return { success: false, msg: error.message };
    }
};

// Cancel a sent access request (sender cancels their own request)
export const cancelAccessRequest = async (requestId, senderId, receiverId) => {
    try {
        // Delete the access request
        const { error: requestError } = await supabase
            .from('profile_access_requests')
            .delete()
            .eq('id', requestId);

        if (requestError) {
            return { success: false, msg: requestError.message };
        }

        // Delete the corresponding notification sent to receiver
        const { error: notifError } = await supabase
            .from('notifications')
            .delete()
            .eq('senderId', senderId)
            .eq('receiverId', receiverId)
            .eq('type', 'profile_access_request')
            .eq('data', JSON.stringify({ requestId: requestId }));

        if (notifError) {
            console.log('Error deleting notification:', notifError);
            // Don't fail the request cancellation if notification deletion fails
            // The important part (request deletion) succeeded
        }

        return { success: true };
    } catch (error) {
        console.log('cancelAccessRequest error:', error);
        return { success: false, msg: error.message };
    }
};

// Delete profile access grant
export const deleteProfileAccess = async (grantId) => {
    try {
        const { error } = await supabase
            .from('profile_access_grants')
            .delete()
            .eq('id', grantId);

        if (error) {
            return { success: false, msg: error.message };
        }

        return { success: true };
    } catch (error) {
        console.log('deleteProfileAccess error:', error);
        return { success: false, msg: error.message };
    }
};
