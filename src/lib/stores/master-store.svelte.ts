import { setContext, getContext } from 'svelte';

// Define interfaces for each section of the store
export interface DirectorInfo {
  firstName: string;
  lastName: string;
  funeralHomeName: string;
  funeralHomeAddress: string;
}

export interface LovedOneInfo {
  fullName: string;
  dateOfBirth?: string; // Optional
  dateOfPassing?: string; // Optional
}

export interface UserInfo {
  fullName: string;
  emailAddress: string;
  dateOfBirth?: string; // Optional
  phoneNumber: string;
}

export interface MemorialLocation {
  name: string;
  address: string;
}

export interface ExtendedMemorialLocation extends MemorialLocation {
  travelExceedsHour: boolean;
  startTime: string;
  duration: number;
  notes: string;
}

export interface ScheduleDay {
  date: string;
  locations: ExtendedMemorialLocation[];
}

export interface MemorialInfo {
  locations: MemorialLocation[];
  startTime?: string; // Optional
  date?: string; // Optional
}

export interface LiveStreamInfo {
  duration?: string; // Optional
  date?: string; // Optional
  startTime?: string; // Optional
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  address: string;
  creditCardDetails?: any; // This would need a more specific type in a real implementation
  isPaymentComplete: boolean;
}

export interface CartItem {
  name: string;
  price: number;
}

export interface PackageInfo {
  selection?: string; // Optional
  priceTotal: number;
  items?: CartItem[];
}

// Unique symbol key for the context
const masterStoreKey = Symbol('masterStore');

export class MasterStore {
  // Director Information
  directorInfo = $state<Partial<DirectorInfo>>({});
  
  // Loved One Information
  lovedOneInfo = $state<Partial<LovedOneInfo>>({});
  
  // User Information
  userInfo = $state<Partial<UserInfo>>({});
  
  // Memorial Information
  memorialInfo = $state<MemorialInfo>({
    locations: [{ name: '', address: '' }]
  });
  
  // Live Stream Information
  liveStreamInfo = $state<Partial<LiveStreamInfo>>({});
  
  // Package Information
  packageInfo = $state<Partial<PackageInfo>>({
    priceTotal: 0,
    items: []
  });
  
  // Billing Information
  billingInfo = $state<Partial<BillingInfo>>({
    isPaymentComplete: false
  });
  
  // Schedule Days
  scheduleDays = $state<ScheduleDay[]>([
    {
      date: new Date().toISOString().split('T')[0],
      locations: [{
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      }]
    }
  ]);

  // Computed property for number of locations
  get numberOfLocations() {
    return this.memorialInfo.locations.length;
  }

  // Computed property for full director name
  get funeralDirectorName() {
    const { firstName, lastName } = this.directorInfo;
    if (!firstName && !lastName) return '';
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  // Methods for updating director information
  updateDirectorInfo(info: Partial<DirectorInfo>) {
    this.directorInfo = { ...this.directorInfo, ...info };
  }

  // Methods for updating loved one information
  updateLovedOneInfo(info: Partial<LovedOneInfo>) {
    this.lovedOneInfo = { ...this.lovedOneInfo, ...info };
  }

  // Methods for updating user information
  updateUserInfo(info: Partial<UserInfo>) {
    this.userInfo = { ...this.userInfo, ...info };
  }

  // Methods for memorial locations
  updateMemorialInfo(info: Partial<Omit<MemorialInfo, 'locations'>>) {
    this.memorialInfo = { 
      ...this.memorialInfo, 
      ...info 
    };
  }

  updateMemorialLocation(index: number, location: Partial<MemorialLocation>) {
    if (index >= 0 && index < this.memorialInfo.locations.length) {
      const locations = [...this.memorialInfo.locations];
      locations[index] = { ...locations[index], ...location };
      this.memorialInfo = { ...this.memorialInfo, locations };
    }
  }

  addMemorialLocation() {
    const locations = [...this.memorialInfo.locations, { name: '', address: '' }];
    this.memorialInfo = { ...this.memorialInfo, locations };
  }

  removeMemorialLocation(index: number) {
    if (this.memorialInfo.locations.length > 1 && index >= 0 && index < this.memorialInfo.locations.length) {
      const locations = this.memorialInfo.locations.filter((_, i) => i !== index);
      this.memorialInfo = { ...this.memorialInfo, locations };
    }
  }

  // Methods for updating live stream information
  updateLiveStreamInfo(info: Partial<LiveStreamInfo>) {
    this.liveStreamInfo = { ...this.liveStreamInfo, ...info };
  }

  // Methods for updating package information
  updatePackageInfo(info: Partial<PackageInfo>) {
    this.packageInfo = { ...this.packageInfo, ...info };
  }

  // Methods for updating billing information
  updateBillingInfo(info: Partial<BillingInfo>) {
    this.billingInfo = { ...this.billingInfo, ...info };
  }

  completePayment() {
    this.billingInfo = { ...this.billingInfo, isPaymentComplete: true };
  }
  
  // Methods for managing schedule days
  updateScheduleDays(days: ScheduleDay[]) {
    this.scheduleDays = [...days];
  }
  
  addScheduleDay() {
    const newDay: ScheduleDay = {
      date: new Date().toISOString().split('T')[0],
      locations: [{
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      }]
    };
    this.scheduleDays = [...this.scheduleDays, newDay];
  }
  
  removeScheduleDay(dayIndex: number) {
    if (this.scheduleDays.length > 1 && dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      this.scheduleDays = this.scheduleDays.filter((_, i) => i !== dayIndex);
    }
  }
  
  addScheduleDayLocation(dayIndex: number) {
    if (dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      const defaultLocation: ExtendedMemorialLocation = {
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      };
      
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: [...updatedDays[dayIndex].locations, defaultLocation]
      };
      
      this.scheduleDays = updatedDays;
    }
  }
  
  removeScheduleDayLocation(dayIndex: number, locationIndex: number) {
    if (
      dayIndex >= 0 &&
      dayIndex < this.scheduleDays.length &&
      locationIndex >= 0 &&
      locationIndex < this.scheduleDays[dayIndex].locations.length &&
      this.scheduleDays[dayIndex].locations.length > 1
    ) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: updatedDays[dayIndex].locations.filter((_, i) => i !== locationIndex)
      };
      
      this.scheduleDays = updatedDays;
    }
  }
  
  updateScheduleDayLocation(dayIndex: number, locationIndex: number, location: Partial<ExtendedMemorialLocation>) {
    if (
      dayIndex >= 0 &&
      dayIndex < this.scheduleDays.length &&
      locationIndex >= 0 &&
      locationIndex < this.scheduleDays[dayIndex].locations.length
    ) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: updatedDays[dayIndex].locations.map((loc, i) =>
          i === locationIndex ? { ...loc, ...location } : loc
        )
      };
      
      this.scheduleDays = updatedDays;
    }
  }
  
  updateScheduleDayDate(dayIndex: number, date: string) {
    if (dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        date
      };
      
      this.scheduleDays = updatedDays;
    }
  }

  // Method to validate required fields
  validateRequiredFields(): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    // Director Info required fields
    if (!this.directorInfo.firstName) missingFields.push('Director\'s First Name');
    if (!this.directorInfo.lastName) missingFields.push('Director\'s Last Name');
    if (!this.directorInfo.funeralHomeName) missingFields.push('Funeral Home Name');
    if (!this.directorInfo.funeralHomeAddress) missingFields.push('Funeral Home Address');
    
    // Loved One Info required fields
    if (!this.lovedOneInfo.fullName) missingFields.push('Loved One\'s Full Name');
    
    // User Info required fields
    if (!this.userInfo.fullName) missingFields.push('User\'s Full Name');
    if (!this.userInfo.emailAddress) missingFields.push('User\'s Email Address');
    if (!this.userInfo.phoneNumber) missingFields.push('User\'s Phone Number');
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Method to reset the store
  reset() {
    this.directorInfo = {};
    this.lovedOneInfo = {};
    this.userInfo = {};
    this.memorialInfo = { locations: [{ name: '', address: '' }] };
    this.liveStreamInfo = {};
    this.packageInfo = { priceTotal: 0, items: [] };
    this.billingInfo = { isPaymentComplete: false };
    this.scheduleDays = [{
      date: new Date().toISOString().split('T')[0],
      locations: [{
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      }]
    }];
  }

  // Method to save to localStorage
  saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      const data = {
        directorInfo: this.directorInfo,
        lovedOneInfo: this.lovedOneInfo,
        userInfo: this.userInfo,
        memorialInfo: this.memorialInfo,
        liveStreamInfo: this.liveStreamInfo,
        packageInfo: this.packageInfo,
        billingInfo: this.billingInfo,
        scheduleDays: this.scheduleDays
      };
      localStorage.setItem('funeralServiceData', JSON.stringify(data));
    }
  }

  // Method to load from localStorage
  loadFromLocalStorage(): boolean {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('funeralServiceData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          this.directorInfo = data.directorInfo || {};
          this.lovedOneInfo = data.lovedOneInfo || {};
          this.userInfo = data.userInfo || {};
          this.memorialInfo = data.memorialInfo || { locations: [{ name: '', address: '' }] };
          this.liveStreamInfo = data.liveStreamInfo || {};
          this.packageInfo = data.packageInfo || { priceTotal: 0, items: [] };
          this.billingInfo = data.billingInfo || { isPaymentComplete: false };
          this.scheduleDays = data.scheduleDays || [{
            date: new Date().toISOString().split('T')[0],
            locations: [{
              name: '',
              address: '',
              travelExceedsHour: false,
              startTime: '09:00',
              duration: 2,
              notes: ''
            }]
          }];
          return true;
        } catch (e) {
          console.error('Failed to parse saved data:', e);
        }
      }
    }
    return false;
  }
}

export function setMasterStoreContext() {
  const store = new MasterStore();
  setContext(masterStoreKey, store);
  return store;
}

export function getMasterStoreContext(): MasterStore {
  return getContext(masterStoreKey);
}