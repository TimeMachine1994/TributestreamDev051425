import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';

export type Status = 'draft' | 'published' | 'archived';

export type TributeAttributes = Omit<ApiTributeTribute['attributes'], 'status'> & {
  status?: Status; 
};

export interface Tribute {
  id: number;
  attributes?: TributeAttributes; // Make attributes property itself optional
}
