import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {
        //upload image
        if(post.file && typeof post.file == "object"){
            let isImage = post?.file?.type == "image";
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage)
            if(fileResult.success){
                post.file = fileResult.data;
            }else{
                return fileResult;
            }
        }

        const {data, error} = await supabase
        .from("posts")
        .upsert(post)
        .select()
        .single();

        if(error){
            console.log('create post error: ', error);
            return { success: false, message: 'Error creating post' };
        }
        return {success:true, data: data};
        
    } catch (error) {
        console.log('create post error: ', error);
        return { success: false, message: 'Error creating post' };
    }
}

export const fetchPosts = async (limit = 10) => {
    try {
       const {data, error} = await supabase
       .from("posts")
       .select(`
            *,
            user: users(id, name, image),
            postLikes(*)
        `)
       .order('created_at', {ascending:false})
       .limit(limit)

       if(error){
           console.log('fetch posts error: ', error);
           return { success: false, message: 'Error fetching posts' };
       }
       return {success:true, data:data};

    } catch (error) {
        console.log('fetch post error: ', error);
        return { success: false, message: 'Error fetchig post' };
    }
}

export const createPostLike = async (postLike) => {
    try {
       const {data, error} = await supabase
       .from("postLikes")
       .insert(postLike)
       .select()
       .single();


       if(error){
           console.log('postLike error: ', error);
           return { success: false, message: 'Error liking posts' };
       }
       return {success:true, data:data};

    } catch (error) {
        console.log('postLike error: ', error);
        return { success: false, message: 'Error liking post' };
    }
}

export const removePostLike = async (postId, userId) => {
    try {
       const {error} = await supabase
       .from("postLikes")
       .delete()
       .eq('userId', userId)
       .eq('postId', postId);

       
       if(error){
           console.log('postLike error: ', error);
           return { success: false, message: 'Error removing likes on posts' };
       }
       return {success: true};

    } catch (error) {
        console.log('postLike error: ', error);
        return { success: false, message: 'Error removing likes on posts' };
    }
}