import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';

export type TributeAttributes = ApiTributeTribute['attributes'];

export interface Tribute {
  id: number;
  attributes: TributeAttributes;
}