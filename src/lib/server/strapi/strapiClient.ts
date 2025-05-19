import { strapi } from '@strapi/client';
import { STRAPI_API_URL} from '$env/static/private'

const client = strapi({baseURL: STRAPI_API_URL});

export default client;