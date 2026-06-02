// Mock data for children
const mockChildrenDatabase = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        dob: '2014-05-15',
        age: 10,
        grade: '5th',
        familyName: 'Doe Family',
        familyId: 'family-001'
    },
    {
        id: 2,
        firstName: 'Johnny',
        lastName: 'Smith',
        gender: 'Male',
        dob: '2016-08-22',
        age: 8,
        grade: '3rd',
        familyName: 'Smith Family',
        familyId: 'family-002'
    },
    {
        id: 3,
        firstName: 'Jonathan',
        lastName: 'Brown',
        gender: 'Male',
        dob: '2012-11-30',
        age: 12,
        grade: '7th',
        familyName: 'Brown Family',
        familyId: 'family-003'
    },
    {
        id: 4,
        firstName: 'Joan',
        lastName: 'Wilson',
        gender: 'Female',
        dob: '2015-03-18',
        age: 9,
        grade: '4th',
        familyName: 'Wilson Family',
        familyId: 'family-004'
    },
    {
        id: 5,
        firstName: 'Jane',
        lastName: 'Davis',
        gender: 'Female',
        dob: '2013-07-08',
        age: 11,
        grade: '6th',
        familyName: 'Davis Family',
        familyId: 'family-005'
    },
    {
        id: 6,
        firstName: 'Jennifer',
        lastName: 'Taylor',
        gender: 'Female',
        dob: '2014-12-03',
        age: 10,
        grade: '5th',
        familyName: 'Taylor Family',
        familyId: 'family-006'
    },
    {
        id: 7,
        firstName: 'James',
        lastName: 'Anderson',
        gender: 'Male',
        dob: '2015-09-25',
        age: 9,
        grade: '4th',
        familyName: 'Anderson Family',
        familyId: 'family-007'
    },
    {
        id: 8,
        firstName: 'Sarah',
        lastName: 'Johnson',
        gender: 'Female',
        dob: '2013-03-12',
        age: 11,
        grade: '6th',
        familyName: 'Johnson Family',
        familyId: 'family-008'
    },
    {
        id: 9,
        firstName: 'Michael',
        lastName: 'Williams',
        gender: 'Male',
        dob: '2014-07-20',
        age: 10,
        grade: '5th',
        familyName: 'Williams Family',
        familyId: 'family-009'
    },
    {
        id: 10,
        firstName: 'Emily',
        lastName: 'Jones',
        gender: 'Female',
        dob: '2016-11-15',
        age: 8,
        grade: '3rd',
        familyName: 'Jones Family',
        familyId: 'family-010'
    }
];

// Add these mock functions to your APIS object

const CustomMockApi = {
    
    searchChildren: async (searchTerm) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = mockChildrenDatabase.filter(child =>
                    child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    child.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                resolve({
                    status: 200,
                    data: filtered
                });
            }, 500); // Simulate network delay
        });
    },

  
    checkDuplicateChild: async (payload) => {
        console.log('Checking duplicate for payload:', payload);
        return new Promise((resolve) => {
            setTimeout(() => {
                const { firstName, lastName, gender, dob } = payload;

                // Normalize dates for comparison (compare only YYYY-MM-DD)
                const normalizeDOB = (date) => {
                    if (!date) return null;
                    const d = new Date(date);
                    return d.toISOString().split('T')[0];
                };

                const searchDOB = normalizeDOB(dob);

                // Check for exact match
                const exactMatch = mockChildrenDatabase.find(child => 
                    child.firstName.toLowerCase() === firstName.toLowerCase() &&
                    child.gender.toLowerCase() === gender.toLowerCase() &&
                    normalizeDOB(child.dob) === searchDOB
                );

                if (exactMatch) {
                    resolve({
                        status: 200,
                        data: {
                            isDuplicate: true,
                            existingChild: exactMatch,
                            matchType: 'exact',
                            message: 'An exact match was found in the system'
                        }
                    });
                    return;
                }

                // Check for partial match (same name and DOB, different gender)
                const partialMatch = mockChildrenDatabase.find(child => 
                    child.firstName.toLowerCase() === firstName.toLowerCase() &&
                    normalizeDOB(child.dob) === searchDOB
                );

                if (partialMatch) {
                    resolve({
                        status: 200,
                        data: {
                            isDuplicate: true,
                            existingChild: partialMatch,
                            matchType: 'partial',
                            message: 'A similar child was found (different gender)'
                        }
                    });
                    return;
                }

                // Check for possible match (same name, different DOB)
                const possibleMatch = mockChildrenDatabase.find(child => 
                    child.firstName.toLowerCase() === firstName.toLowerCase() 
                    //&&
                   // child.lastName.toLowerCase() === lastName.toLowerCase()
                );

                if (possibleMatch) {
                    resolve({
                        status: 200,
                        data: {
                            isDuplicate: true,
                            existingChild: possibleMatch,
                            matchType: 'possible',
                            message: 'A child with the same name was found (different date of birth)'
                        }
                    });
                    return;
                }

                // No match found
                resolve({
                    status: 200,
                    data: {
                        isDuplicate: false,
                        existingChild: null,
                        matchType: null,
                        message: 'No duplicate found'
                    }
                });

            }, 800); // Simulate network delay
        });
    },

    
};

export default CustomMockApi;