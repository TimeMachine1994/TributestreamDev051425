import { strapi } from './client';
import type { Tribute } from '../types';

export async function createTribute(data: Tribute) {
  const entry = await strapi.collection('tributes').create(data);
  return entry;
}

export async function getTributeById(id: string) {
  const entry = await strapi.collection('tributes').findOne(id);
  return entry;
}

export async function updateTribute(id: string, data: Partial<Tribute>) {
  const entry = await strapi.collection('tributes').update(id, data);
  return entry;
}

export async function deleteTribute(id: string) {
  const entry = await strapi.collection('tributes').delete(id);
  return entry;
}