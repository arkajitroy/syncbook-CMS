"use client"

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { DefaultValues, FieldValues, Path, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { ZodType } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FIELD_NAMES, FIELD_TYPES } from '@/constants';
import Link from 'next/link';
import ImageUpload from './ImageUpload';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface Props<T extends FieldValues> {                                  // Puede manejar cualquier tipo de datos para el formulario.
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {

  const router = useRouter();

  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({                                // useForm se utiliza para inicializar el formulario
    resolver: zodResolver(schema),                                        // resolver valida los datos enviados
    defaultValues: defaultValues as DefaultValues<T>,                     // DefaultValues inicializa los valores del formulario por defecto
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast({
        title: "Success",
        description: isSignIn
          ? "You have successfully signed in."
          : "You have successfully signed up.",
      });

      router.push("/");
    } else {
      toast({
        title: `Error ${isSignIn ? "signing in" : "signing up"}`,
        description: result.error ?? "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-semibold text-white'>
        {isSignIn ? 'Welcome back to BookWise' : 'Create an account'}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collection of resources, and stay updated"
          : "Please complete all fields and upload a valid university ID to gain access to the library"}
      </p>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)}     
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((field) => (       // Se recorren las claves de defaultValues para generar dinámicamente los campos del formulario
            <FormField                                       // FormField es un componente que encapsula la lçogica de cada campo del formulario
              key={field}
              control={form.control}
              name={field as Path<T>}                        // Path<T>: Es un tipo de React Hook Form que asegura que el nombre del campo (name) sea una clave válida de T.
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='capitalize'>
                    {/* FIELD_NAMES y FIELD_TYPES: Son constantes que definen las etiquetas y tipos de los campos. */}
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]} 
                  </FormLabel>
                  <FormControl>
                    {field.name === "universityCard" ? (
                      <ImageUpload
                        type="image"
                        accept="image/*"
                        placeholder="Upload your ID"
                        folder="ids"
                        variant="dark"
                        onFileChange={field.onChange}// Se pasa la función onChange de field a onFileChange de ImageUpload
                      />
                    ) : (
                      <Input
                        required
                          type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]} // Define el tipo de entrada (text, email, password)
                        {...field}                                                   // Se pasan las propiedades de field a Input (value, onChange, onBlur) -> conecta el input con reactHookForm -> maneja su estado y validación
                        className="form-input"
                      />
                    )}
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookWise? " : "Already have an account? "}

        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm