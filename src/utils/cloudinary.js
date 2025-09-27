import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config(
    {
        cloud_name : process.env.CLOUD_NAME,
        api_key : process.env.API_KEY,
        api_secret : process.env.API_SECRET
    }
)

const uploadOnCloudinary = async(filePath) => {
    try {
        if(!filePath) return null
        const response = await cloudinary.uploader.upload(filePath , {resource_type : 'auto'})

        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
        }
        
        return response    
    } 
    catch (error) {
        fs.unlinkSync(filePath)
        return null
    }
}

const deleteOnCloudinary = async(public_id , resource_type="image")=> {
    try {
        if(!public_id) return null
        const result = await cloudinary.uploader.destroy(public_id , {resource_type:`${resource_type}`})
        return result
    } 
    catch (error) {
        console.log("Failed to delete file from clodinary" , error.message);
        
    }
}


export {uploadOnCloudinary , deleteOnCloudinary}