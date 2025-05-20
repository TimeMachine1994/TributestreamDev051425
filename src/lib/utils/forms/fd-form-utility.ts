import type { FdFormInput, Tribute, User, FuneralHome } from '$lib/types/types';

/**
 * Processes an FdFormInput to create a Tribute and associated User.
 * If the funeral director is registered, associates the tribute accordingly.
 */
export function processFdFormInput(input: FdFormInput, existingFuneralDirector?: User): {
	tribute: Tribute;
	familyContact: User;
	funeralHomeAssociation?: {
		directorName: string;
		associated: boolean;
	};
} {
	console.log('📝 Processing FD Form Input:', input);

	// Create the family contact user
	const familyContact: User = {
		id: Date.now(),
		documentId: `user-${Date.now()}`,
		username: input.familyMemberName.toLowerCase().replace(/\s+/g, '_'),
		email: input.email,
		provider: 'local',
		confirmed: true,
		blocked: false,
		fullName: input.familyMemberName,
		phoneNumber: input.phone,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		publishedAt: new Date().toISOString(),
		role: {
			id: 2,
			documentId: 'role-family-contact',
			name: 'Family Contact',
			description: 'User who submitted the tribute form',
			type: 'family-contact',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			publishedAt: new Date().toISOString()
		}
	};

	console.log('👤 Created Family Contact User:', familyContact);

	// Create the tribute
	const tribute: Tribute = {
		name: input.lovedOneName,
		slug: input.lovedOneName.toLowerCase().replace(/\s+/g, '-'),
		description: `Tribute for ${input.lovedOneName}`,
		status: 'draft',
		owner: familyContact
	};

	console.log('🕊️ Created Tribute:', tribute);

	// Check if the director is registered via passed-in user
	let funeralHomeAssociation;
	if (existingFuneralDirector && existingFuneralDirector.role?.type === 'funeral-director') {
		console.log('✅ Director is registered:', existingFuneralDirector.fullName);
		funeralHomeAssociation = {
			directorName: existingFuneralDirector.fullName,
			associated: true
		};
	} else {
		console.log('❌ Director is NOT registered:', input.directorName);
	}

	return {
		tribute,
		familyContact,
		funeralHomeAssociation
	};
}
