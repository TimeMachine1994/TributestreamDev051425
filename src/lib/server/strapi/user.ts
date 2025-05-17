import { getStrapiClient } from './client';
import type { User } from '../types';
import type { RequestEvent } from '@sveltejs/kit';

export async function createUser(data: User, event: RequestEvent) {
  const strapi = getStrapiClient(event);
  const entry = await strapi.collection('users').create(data);
  return entry;
}

export async function getUserById(id: string, event: RequestEvent) {
  const strapi = getStrapiClient(event);
  const entry = await strapi.collection('users').findOne(id, {
    populate: ['role']
  });
  return entry;
}

export async function updateUser(id: string, data: Partial<User>, event: RequestEvent) {
  const strapi = getStrapiClient(event);
  const entry = await strapi.collection('users').update(id, data);
  return entry;
}

export async function deleteUser(id: string, event: RequestEvent) {
  const strapi = getStrapiClient(event);
  const entry = await strapi.collection('users').delete(id);
  return entry;
}

export async function getCurrentUser(jwt: string, event: RequestEvent) {
  const strapi = getStrapiClient(event);
  const user = await strapi.fetch('users/me?populate=role', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    }
  });
  return user;
}