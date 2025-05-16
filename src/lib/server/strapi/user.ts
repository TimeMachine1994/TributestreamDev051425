import { strapi } from './client';
import type { User } from '../types';

export async function createUser(data: User) {
  const entry = await strapi.collection('users').create(data);
  return entry;
}

export async function getUserById(id: string) {
  const entry = await strapi.collection('users').findOne(id);
  return entry;
}

export async function updateUser(id: string, data: Partial<User>) {
  const entry = await strapi.collection('users').update(id, data);
  return entry;
}

export async function deleteUser(id: string) {
  const entry = await strapi.collection('users').delete(id);
  return entry;
}
export async function getCurrentUser(jwt: string) {
  const user = await strapi.fetch('users/me?populate=role', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    }
  });
  return user;
}