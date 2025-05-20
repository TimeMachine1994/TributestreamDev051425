/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      name?: string;
      email: string;
      role?: {
        id: string;
        name: string;
        type: string;
      };
    } | null;
  }
}
