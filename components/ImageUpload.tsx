"use client"

import React, { useRef, useState } from 'react'
import { 
  IKImage,
  IKVideo, 
  ImageKitProvider, 
  IKUpload, 
  ImageKitContext 
} from "imagekitio-next";
import config from '@/lib/config';
import Image from 'next/image';
import { toast } from "@/hooks/use-toast";

const {
  env: {
    imagekit: { 
      publicKey, 
      urlEndpoint 
    },
  },
} = config;

interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
}

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/imageKit`) // Devuelve los parametros de autenticación
    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { token, expire, signature };

  } catch (error:any) {
    throw new Error(`Authentication request failed: ${error}`);
  }
}

const ImageUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: Props) => {

  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });
  const [progress, setProgress] = useState(0);

  const onError = (error:any) => {
    console.log(error);
    toast({
      title: `${type} upload failed`,
      description: `Your ${type} could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  }

  const onSuccess = (res:any) => {
    setFile(res)               // Se actualiza el estado file con la respuesta del servidor
    onFileChange(res.filePath) // Se ejecuta la función onFileChange con el filePath de la respuesta
    toast({
      title: `${type} uploaded successfully`,
      description: `${res.filePath} uploaded successfully!`,
    });
  }

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload 
        className='hidden'
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="text-upload.png"
      />
      <button 
        className='upload-btn bg-dark-300'
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {      // Si la ref existe
            // @ts-ignore
            ikUploadRef.current?.click(); // Abre el selector de archivos
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className='text-base text-light-100'>Upload a File</p>

        {file && <p className='upload-filename'>{file.filePath}</p>}
      </button>

      {file && file.filePath &&(
        <IKImage 
          alt={file.filePath || "default-alt"}
          path={file.filePath || ""}
          width={500}
          height={500}
        />
      )}
    </ImageKitProvider>
  )
}

export default ImageUpload