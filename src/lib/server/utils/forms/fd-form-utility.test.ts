import { describe, it, expect } from 'vitest';
import { processFdFormInput } from './fd-form-utility';
import type { FdFormInput, User } from '$lib/server/types';

describe('processFdFormInput', () => {
	const baseInput: FdFormInput = {
		directorName: 'Jane Smith',
		familyMemberName: 'Alice Johnson',
		lovedOneName: 'Bob Johnson',
		email: 'alice@example.com',
		phone: '123-456-7890',
		locationName: 'Peaceful Chapel',
		locationAddress: '123 Main St',
		memorialDate: '2025-05-20',
		memorialTime: '14:00'
	};

	it('creates tribute and user without funeral director', () => {
		const result = processFdFormInput(baseInput);
		expect(result.tribute.name).toBe('Bob Johnson');
		expect(result.tribute.owner.fullName).toBe('Alice Johnson');
		expect(result.familyContact.role.type).toBe('family-contact');
		expect(result.funeralHomeAssociation).toBeUndefined();
	});

	it('associates tribute with registered funeral director', () => {
		const director: User = {
			id: 1,
			documentId: 'user-1',
			username: 'jane_smith',
			email: 'jane@example.com',
			provider: 'local',
			confirmed: true,
			blocked: false,
			fullName: 'Jane Smith',
			phoneNumber: '555-555-5555',
			createdAt: '',
			updatedAt: '',
			publishedAt: '',
			role: {
				id: 3,
				documentId: 'role-fd',
				name: 'Funeral Director',
				description: '',
				type: 'funeral-director',
				createdAt: '',
				updatedAt: '',
				publishedAt: ''
			}
		};

		const result = processFdFormInput(baseInput, director);
		expect(result.funeralHomeAssociation?.associated).toBe(true);
		expect(result.funeralHomeAssociation?.directorName).toBe('Jane Smith');
	});

	it('ignores non-funeral-director user', () => {
		const nonFdUser: User = {
			...JSON.parse(JSON.stringify({
				id: 2,
				documentId: 'user-2',
				username: 'admin_user',
				email: 'admin@example.com',
				provider: 'local',
				confirmed: true,
				blocked: false,
				fullName: 'Admin User',
				phoneNumber: '555-000-0000',
				createdAt: '',
				updatedAt: '',
				publishedAt: '',
				role: {
					id: 4,
					documentId: 'role-admin',
					name: 'Admin',
					description: '',
					type: 'admin',
					createdAt: '',
					updatedAt: '',
					publishedAt: ''
				}
			}))
		};

		const result = processFdFormInput(baseInput, nonFdUser);
		expect(result.funeralHomeAssociation).toBeUndefined();
	});
});