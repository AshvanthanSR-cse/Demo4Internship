require("dotenv").config();

const {

    S3Client,

    PutObjectCommand,

    ListObjectsV2Command

} = require("@aws-sdk/client-s3");

const s3 = new S3Client({

    region: process.env.AWS_REGION

});


/* =======================================

   CREATE USER FOLDER

======================================= */

async function createFolder(username) {

    const params = {

        Bucket: process.env.S3_BUCKET,

        Key: `${username}/`

    };

    try {

        await s3.send(

            new PutObjectCommand(params)

        );

        console.log(

            `Folder Created : ${username}`

        );

    }

    catch (error) {

        console.log(error);

    }

}


/* =======================================

   UPLOAD FILE

======================================= */

async function uploadFile(

    username,

    fileName,

    fileBuffer

) {

    const params = {

        Bucket: process.env.S3_BUCKET,

        Key: `${username}/${fileName}`,

        Body: fileBuffer

    };

    try {

        await s3.send(

            new PutObjectCommand(params)

        );

        console.log(

            `${fileName} Uploaded Successfully`

        );

    }

    catch (error) {

        console.log(error);

    }

}


/* =======================================

   LIST FILES

======================================= */

async function listFiles(username) {

    const params = {

        Bucket: process.env.S3_BUCKET,

        Prefix: `${username}/`

    };

    try {

        const data = await s3.send(

            new ListObjectsV2Command(params)

        );

        if (!data.Contents)

            return [];

        return data.Contents.map(

            file => file.Key

        );

    }

    catch (error) {

        console.log(error);

        return [];

    }

}


module.exports = {

    createFolder,

    uploadFile,

    listFiles

};