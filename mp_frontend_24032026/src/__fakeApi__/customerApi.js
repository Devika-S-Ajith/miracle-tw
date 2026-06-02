//import { subDays, subHours, subMinutes, subSeconds } from 'date-fns';

const now = new Date();

class CustomerApi {

  getFamilies() {
    const families = [
      {
        organization_name: "The Smiling Kids",
        familyId: "b51775bffe73a24e180a64d81f",
        child: "Johns Michael",
        childId: "5",
        address1: "123 Street",
        address2: "xyz bldg",
        country: "India",
        state: "Kerala",
        city: "Ernakulam",
        status: true,
        zip_code: "677891",
        language: "English",
        children: [
          {
            first_name: "Halsey",
            last_name: "Ray",
            childId: "25b562183e6f45d8aa1f24c3936921d3",
            care_giver_id: "837wsx",
            case_manager: "Keeley Owen"

          },
          {
            first_name: "Jenson",
            last_name: "Walsh",
            childId: "2162736a9b944806850c227471c285b6",
            care_giver_id: "837wsx",
            case_manager: "Paul Thompson"

          },
          {
            first_name: "Carly",
            last_name: "Anderson",
            childId: "b67860bfaddd4064812e9360a4cbef3d",
            care_giver_id: "823ehh",
            case_manager: "Janet Morris"

          }

        ],
        care_givers: [
          {
            care_giver_id: "823ehh",
            first_name: "Robert",
            last_name: "Doe",
            phone: '958375124',
            email: "robert.doe@nomail.com",
            relation_with_child: "Foster",
            is_primary: false,
            occupation: "Artist"
          },
          {
            care_giver_id: "837wsx",
            first_name: "James",
            last_name: "Shrader",
            phone: '72490347492',
            email: "james.shrader@nomail.com",
            relation_with_child: "Foster",
            is_primary: true,
            occupation: "Business"
          },
          {
            care_giver_id: "528esq",
            first_name: "John",
            last_name: "Dane",
            phone: '9432979254',
            email: "john.dane@nomail.com",
            relation_with_child: "Foster",
            is_primary: false,
            occupation: "Bank Manager"
          }
        ],
        other_members: [
          {
            first_name: "Jickson",
            last_name: "Perrera",
            occupation: "Business",
            other_member_id: "27",
            phone: '66749947498',
            email: "jickson@gmail.com",
            relation_with_child: "Foster Brother"
          },
          {
            first_name: "Marie",
            last_name: "Roger",
            occupation: "Business",
            other_member_id: "28",
            phone: '88754985875',
            email: "marie.roger@gmail.com",
            relation_with_child: "Foster Sister"
          }
        ]

      },
      {
        organization_name: "St:George Foundations",
        familyId: "9f80c0ed6db3c452012d482136",
        child: "Saleena G",
        childId: "6",
        address1: "567 Street",
        address2: "pqr bldg",
        country: "India",
        state: "Maharastra",
        city: "Pune",
        zip_code: "699837",
        language: "Hindi",
        status: true,
        children: [
          {
            first_name: "Shannon",
            last_name: "Weaver",
            childId: "fe8dec76ecb94d69b34c59fe71ca80de",
            care_giver_id: "823ehh",
            case_manager: "Ashley Watson"

          },
          {
            first_name: "Douglas",
            last_name: "George",
            childId: "b7457b6144f941e2b2d316ee8c6b00b0",
            care_giver_id: "528esq",
            case_manager: "Arthur Benedict"

          },
          {
            first_name: "Jennifer",
            last_name: "Herrera",
            childId: "a6350b6144f941e2bec76ecb94db27a7",
            care_giver_id: "528esq",
            case_manager: "Samuel Jackson"

          }

        ],
        care_givers: [
          {
            care_giver_id: "823ehh",
            first_name: "Robert",
            last_name: "Doe",
            phone: '958375124',
            email: "robert.doe@nomail.com",
            is_primary: true,
            relation_with_child: "Foster Father",
            occupation: "Software Engineer"
          },
          {
            care_giver_id: "528esq",
            first_name: "John",
            last_name: "Dane",
            phone: '9432979254',
            email: "john.dane@nomail.com",
            is_primary: false,
            relation_with_child: "Foster",
            occupation: "Business"
          }
        ],
        other_members: [
          {
            first_name: "Dwayne",
            last_name: "Johnson",
            occupation: "Business",
            other_member_id: "29",
            phone: '9974588364',
            email: "dwayne.j@gmail.com",
            relation_with_child: "Foster Brother"
          },
          {
            first_name: "Alinda",
            last_name: "Ann",
            occupation: "Business",
            other_member_id: "30",
            phone: '7785509374',
            email: "alindaann@yahoo.com",
            relation_with_child: "Foster Sister"
          }
        ]

      },

    ];
    return Promise.resolve(families);
  }

  getUsers() {
    const users = [
      {
        name: 'Carson Darrin',
        firstname: 'Carson',
        lastname: 'Darrin',
        id: '5ece2ce3613486d95ffaea58',
        organizationId: '13',
        avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
        city: 'Cleveland',
        country: 'USA',
        related_org: 'Home For Happiness',
        email: 'carson.darrin@hfh.org',
        state: 'Ohio',
        phone: '918375384',
        // status : "Active",
        addressLine1: '4143 Mount Street',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'
      },
      {
        name: 'Ermaun Dart',
        firstname: 'Ermaun',
        lastname: 'Dart',
        id: '5ece2ce8cebf7ad1d100c0cd',
        organizationId: '15',
        avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
        city: 'Cleveland',
        country: 'USA',
        related_org: 'Smile Kids Foundation',
        email: 'ermaun.dart@smk.io',
        state: 'Ohio',
        phone: '918375384',
        // status : "Active",
        addressLine1: '4338 Beeghley Street',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'

      },
      {
        name: 'Penjani Inyene',
        firstname: 'Penjani',
        lastname: 'Inyene',
        id: '5e887a1fbefd7938eea9c981',
        organizationId: '17',
        avatar: '/static/mock-images/avatars/avatar-penjani_inyene.png',
        city: 'Berkeley',
        country: 'USA',
        related_org: 'Rainbow Homes',
        email: 'penjani.inyene@rainbowhomes.io',
        state: 'California',
        phone: '9188263753',
        // status : "InActive",
        addressLine1: '3710 Coleman Avenue',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'
      },
      {
        name: 'Miron Vitold',
        firstname: 'Miron',
        lastname: 'Vitold',
        id: '5e86805e2bafd54f66cc95c3',
        organizationId: '18',
        avatar: '/static/mock-images/avatars/avatar-miron_vitold.png',
        city: 'San Diego',
        country: 'USA',
        related_org: 'We Care Foundations',
        email: 'miron.vitold@wecarefoundations.io',
        state: 'California',
        phone: '7182736499',
        // status : "Active",
        addressLine1: '3121 Fittro Street',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'
      },
      {
        name: 'Jane Rotanson',
        firstname: 'Jane',
        lastname: 'Rotanson',
        id: '5e86809283e28b96d2d38537',
        organizationId: '19',
        avatar: '/static/mock-images/avatars/avatar-jane_rotanson.png',
        city: 'Madrid',
        country: 'Spain',
        related_org: 'New Child Care Home',
        email: 'rotansonjane@ncch.com',
        state: 'Madrid',
        // status : "Active",
        phone: '9184756257',
        addressLine1: '1088 Oral Lake Road',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'
      },
      {
        name: 'Jie Yan Song',
        firstname: 'Jie Yan',
        lastname: 'Song',
        id: '5ece2ce3613486d95ffasg52',
        organizationId: '20',
        avatar: '/static/mock-images/avatars/avatar-jie_yan_song.png',
        city: 'North Canton',
        country: 'USA',
        related_org: 'St.Peters Homes',
        email: 'jieyan@sph.org',
        state: 'Ohio',
        phone: '718325381',
        // status : "Active",
        addressLine1: '4843 Little Street',
        addressLine2: '2849 Boulevard',
        status: true,
        role: 'Admin',
        zipcode: '93301'
      },
    ];

    return Promise.resolve(users);
  }
  getCustomers() {
    const customers = [
      {
        id: '5e887ac47eed253091be10cb',
        avatar: '/static/mock-images/avatars/avatar-carson_darrin.png',
        city: 'Cleveland',
        country: 'USA',
        currency: '$',
        email: 'carson.darrin@devias.io',
        hasAcceptedMarketing: true,
        isProspect: false,
        isReturning: true,
        name: 'Carson Darrin',
        state: 'Ohio',
        totalAmountSpent: 300.00,
        totalOrders: 3,
        //updatedAt: subDays(subHours(now, 7), 1).getTime()
        updatedAt: "Today at 5:00PM",
        phone: '918375384',
        status: "Active",
        type: "CCI",
      },
      {
        id: '5e887b209c28ac3dd97f6db5',
        avatar: '/static/mock-images/avatars/avatar-fran_perez.png',
        city: 'Atlanta',
        country: 'USA',
        currency: '$',
        email: 'fran.perez@devias.io',
        hasAcceptedMarketing: true,
        isProspect: true,
        isReturning: false,
        name: 'Fran Perez',
        state: 'Georgia',
        totalAmountSpent: 0.00,
        totalOrders: 0,
        updatedAt: "Today at 5:00PM",
        phone: '718977881',
        status: "Active",
        type: "Partner Organization",
      },
      {
        id: '5e887b7602bdbc4dbb234b27',
        avatar: '/static/mock-images/avatars/avatar-jie_yan_song.png',
        city: 'North Canton',
        country: 'USA',
        currency: '$',
        email: 'jie.yan.song@devias.io',
        hasAcceptedMarketing: false,
        isProspect: false,
        isReturning: false,
        name: 'Jie Yan Song',
        state: 'Ohio',
        totalAmountSpent: 5600.00,
        totalOrders: 6,
        updatedAt: "Today at 5:00PM",
        phone: '8194867267',
        status: "Active",
        type: "CCI",
      },
      {
        id: '5e86809283e28b96d2d38537',
        avatar: '/static/mock-images/avatars/avatar-jane_rotanson.png',
        city: 'Madrid',
        country: 'Spain',
        currency: '$',
        email: 'jane.rotanson@devias.io',
        hasAcceptedMarketing: true,
        isProspect: false,
        isReturning: true,
        name: 'Jane Rotanson',
        state: 'Madrid',
        totalAmountSpent: 500.00,
        totalOrders: 1,
        updatedAt: "Today at 5:00PM",
        phone: '9184756257',
        status: "Active",
        type: "CCI",
      },
      {
        id: '5e86805e2bafd54f66cc95c3',
        avatar: '/static/mock-images/avatars/avatar-miron_vitold.png',
        city: 'San Diego',
        country: 'USA',
        currency: '$',
        email: 'miron.vitold@devias.io',
        hasAcceptedMarketing: true,
        isProspect: true,
        isReturning: false,
        name: 'Miron Vitold',
        totalAmountSpent: 0.00,
        totalOrders: 0,
        state: 'California',
        updatedAt: "Today at 5:00PM",
        phone: '7182736499',
        status: "Active",
        type: "Government",
      },
      {
        id: '5e887a1fbefd7938eea9c981',
        avatar: '/static/mock-images/avatars/avatar-penjani_inyene.png',
        city: 'Berkeley',
        country: 'USA',
        currency: '$',
        email: 'penjani.inyene@devias.io',
        hasAcceptedMarketing: false,
        isProspect: true,
        isReturning: false,
        name: 'Penjani Inyene',
        state: 'California',
        totalAmountSpent: 0.00,
        totalOrders: 0,
        updatedAt: "Today at 5:00PM",
        phone: '9188263753',
        status: "InActive",
        type: "CCI",
      },
      {
        id: '5e887d0b3d090c1b8f162003',
        avatar: '/static/mock-images/avatars/avatar-omar_darobe.png',
        currency: '$',
        email: 'omar.darobe@devias.io',
        hasAcceptedMarketing: true,
        isProspect: false,
        isReturning: false,
        city: 'Carson City',
        country: 'USA',
        name: 'Omar Darobe',
        state: 'Nevada',
        totalAmountSpent: 100.00,
        totalOrders: 4,
        updatedAt: "Today at 5:00PM",
        status: "Active"
      },
      {
        id: '5e88792be2d4cfb4bf0971d9',
        avatar: '/static/mock-images/avatars/avatar-siegbert_gottfried.png',
        city: 'Los Angeles',
        country: 'USA',
        currency: '$',
        email: 'siegbert.gottfried@devias.io',
        hasAcceptedMarketing: true,
        isProspect: false,
        isReturning: true,
        name: 'Siegbert Gottfried',
        state: 'California',
        totalAmountSpent: 1000.00,
        totalOrders: 2,
        updatedAt: "Today at 5:00PM"
      },
      {
        id: '5e8877da9a65442b11551975',
        avatar: '/static/mock-images/avatars/avatar-iulia_albu.png',
        city: 'Murray',
        country: 'USA',
        email: 'iulia.albu@devias.io',
        hasAcceptedMarketing: true,
        isProspect: true,
        isReturning: false,
        name: 'Iulia Albu',
        state: 'Utah',
        totalAmountSpent: 0.00,
        totalOrders: 0,
        updatedAt: "Today at 5:00PM"
      },
      {
        id: '5e8680e60cba5019c5ca6fda',
        avatar: '/static/mock-images/avatars/avatar-nasimiyu_danai.png',
        city: 'Salt Lake City',
        country: 'USA',
        currency: '$',
        email: 'nasimiyu.danai@devias.io',
        hasAcceptedMarketing: false,
        isProspect: false,
        isReturning: true,
        name: 'Nasimiyu Danai',
        state: 'Utah',
        totalAmountSpent: 200.00,
        totalOrders: 7,
        updatedAt: "Today at 5:00PM"
      }
    ];

    return Promise.resolve(customers);
  }

  getCustomer() {
    const customer = {
      id: '5e86805e2bafd54f66cc95c3',
      address1: 'Street John Wick, no. 7',
      address2: 'House #25',
      balance: 0,
      city: 'San Diego',
      country: 'USA',
      currency: '$',
      email: 'miron.vitold@devias.io',
      hasDiscountedPrices: false,
      isVerified: true,
      name: 'Miron Vitold',
      phone: '+55 748 327 439',
      state: 'New York',
      vatRate: 19,
      zipCode: '240355',
      type: "CCI"
    };

    return Promise.resolve(customer);
  }

  getCustomerEmails() {
    const emails = [
      {
        id: '5ece2ce3613486d95ffaea58',
        createdAt: "Today at 5:00PM",
        description: 'Order confirmation'
      },
      {
        id: '5ece2ce8cebf7ad1d100c0cd',
        createdAt: "Today at 5:00PM",
        description: 'Order confirmation'
      }
    ];

    return Promise.resolve(emails);
  }

  getUserCases() {
    const cases = [
      {
        id: '66fd5eefcb297bd6030da64a',
        child_name: "James Doe",
        assessments_done: '5',
        organization_name: 'Happy Smiles',
        date: '12/02/2020'
      },
      {
        id: '4af12f0cb4cde9c14fbacb91',
        child_name: "Marie McCanzie",
        assessments_done: '3',
        organization_name: 'Happy Smiles',
        date: '18/07/2020'
      },
      {
        id: '0ddaa62f8bffd4404c13f549',
        child_name: "Antony Rony",
        assessments_done: '6',
        organization_name: 'Happy Smiles',
        date: '11/01/2019'
      },
      {
        id: 'b7d25867ffc35a29180743e9',
        child_name: "Christina Dane",
        assessments_done: '1',
        organization_name: 'Happy Smiles',
        date: '02/05/2019'
      },
      {
        id: '80d060e3519081298c64304c',
        child_name: "Jayden H",
        assessments_done: '12',
        organization_name: 'Happy Smiles',
        date: '16/03/2021'
      },
    ];

    return Promise.resolve(cases);
  }

  getCustomerInvoices() {
    const invoices = [
      {
        id: 'John Doe',
        currency: '$',
        description: 'Admin',
        issueDate: now.getTime(),
        paymentMethod: 'johndoe@placeholdercci.com',
        status: 'active',
        value: 5.25,
        phone: "8893378434"
      },
      {
        id: 'Jane Doe',
        currency: '$',
        description: 'Case Worker',
        issueDate: now.getTime(),
        paymentMethod: 'janedoe@placeholdercci.com',
        status: 'active',
        value: 5.25,
        phone: "7738359457"
      },
      {
        id: 'Morgan Waltson',
        currency: '$',
        description: 'Case Worker',
        issueDate: now.getTime(),
        paymentMethod: 'morganwaltson@placeholdercci.com',
        status: 'active',
        value: 5.25,
        phone: "6792378444"
      }
    ];

    return Promise.resolve(invoices);
  }

  getCustomerLogs() {
    const logs = [
      {
        id: '5ece2cfeb6e2ac847bba11ce',
        createdAt: "Today at 5:00PM",
        description: 'Purchase',
        ip: '84.234.243.42',
        method: 'POST',
        route: '/__fakeApi__/purchase',
        status: 200
      },
      {
        id: '5ece2d02510484b2952e1e05',
        createdAt: "Today at 5:00PM",
        description: 'Purchase',
        ip: '84.234.243.42',
        method: 'POST',
        route: '/__fakeApi__/purchase',
        status: 522
      },
      {
        id: '5ece2d08e2748e4e9788901a',
        createdAt: "Today at 5:00PM",
        description: 'Cart remove',
        ip: '84.234.243.42',
        method: 'DELETE',
        route: '/__fakeApi__/products/d65654e/remove',
        status: 200
      },
      {
        id: '5ece2d0c47214e342c2d7f28',
        createdAt: "Today at 5:00PM",
        description: 'Cart add',
        ip: '84.234.243.42',
        method: 'GET',
        route: '/__fakeApi__/products/d65654e/add',
        status: 200
      },
      {
        id: '5ece2d11e4060a97b2b57623',
        createdAt: "Today at 5:00PM",
        description: 'Cart add',
        ip: '84.234.243.42',
        method: 'GET',
        route: '/__fakeApi__/products/c85727f/add',
        status: 200
      },
      {
        id: '5ece2d16cf6d53d8e33656af',
        createdAt: "Today at 5:00PM",
        description: 'View product',
        ip: '84.234.243.42',
        method: 'GET',
        route: '/__fakeApi__/products/c85727f',
        status: 200
      },
      {
        id: '5ece2d1b2ec5071be9286a96',
        createdAt: "Today at 5:00PM",
        description: 'Get products',
        ip: '84.234.243.42',
        method: 'GET',
        route: '/__fakeApi__/products',
        status: 200
      },
      {
        id: '5ece2d22e68d5498917e47bc',
        createdAt: "Today at 5:00PM",
        description: 'Login',
        ip: '84.234.243.42',
        method: 'POST',
        route: '/__fakeApi__/authentication/login',
        status: 200
      }
    ];

    return Promise.resolve(logs);
  }

  getLocations() {
    const locations =
    {
      "countries": [
        {
          "id": "1",
          "countryName": "India"
        }
      ],
      "states": [
        {
          "id": "1",
          "stateName": "Kerala"
        }
      ],
      "districts": [
        {
          "id": "1",
          "districtName": "Trivandrum"
        }
      ]
    }
    return Promise.resolve(locations)

  }

  getOrganizationType() {
    const types = {
      "organisationTypes": [
        {
          "id": "1",
          "name": "CCI"
        }
      ]
    }
    return Promise.resolve(types)
  }

  getOrganizationList() {
    const lists = {
      "organizations": [
        {
          "id": "13",
          "organizationName": "Organization26",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:09:55.115Z"
        },
        {
          "id": "15",
          "organizationName": "New Org",
          "addressLine1": "a",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "222222",
          "email": "test@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:09:56.894Z"
        },
        {
          "id": "17",
          "organizationName": "Organization30",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:09:58.894Z"
        },
        {
          "id": "18",
          "organizationName": "Organization31",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:09:59.912Z"
        },
        {
          "id": "19",
          "organizationName": "Organization32",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:10:00.913Z"
        },
        {
          "id": "20",
          "organizationName": "Organization33",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:10:01.911Z"
        },
        {
          "id": "21",
          "organizationName": "Organization34",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:10:02.247Z"
        },
        {
          "id": "22",
          "organizationName": "Organization35",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T11:10:02.582Z"
        },
        {
          "id": "23",
          "organizationName": "Organization11",
          "addressLine1": "zzz",
          "addressLine2": "b",
          "zipCode": "808080",
          "phoneNumber": "123456",
          "email": "aaaa@test.com",
          "HTOrganizationTypeId": "1",
          "HTCountryId": "1",
          "HTStateId": "1",
          "HTCityId": "1",
          "isActive": true,
          "createdAt": "2021-08-16T13:49:55.792Z"
        }
      ],
      "pageCount": 1
    }
    return Promise.resolve(lists)
  }

  getChildrenList() {
    const lists = [
      {
        id: '12',
        first_name: "Halsey",
        last_name: "Ray",
        childId: "25b562183e6f45d8aa1f24c3936921d3",
        organization: " The Smiling Kids ",
        care_giver_id: "837wsx",
        caregiver: "Shelley",
        case_manager: "Keeley Owen",
        gender: 'Female',
        birthDate: '15/08/2000',
        language: 'English',
        phone: '9477263850',
        email: 'halseyray@gmail.com',
        isActive: true,
        family: "James Shrader",

      },
      {
        id: '13',
        first_name: "Jenson",
        last_name: "Walsh",
        childId: "2162736a9b944806850c227471c285b6",
        organization: " The Smiling Kids ",
        care_giver_id: "837wsx",
        caregiver: "Kelley",
        case_manager: "Paul Thompson",
        gender: 'Male',
        birthDate: '15/08/2000',
        language: 'English',
        phone: '1010101010',
        email: 'placeholder@placeholder.com',
        isActive: false,
        family: "Robert Doe"

      },
      {
        id: '14',
        first_name: "Carly",
        last_name: "Anderson",
        childId: "b67860bfaddd4064812e9360a4cbef3d",
        organization: " The Smiling Kids ",
        care_giver_id: "823ehh",
        caregiver: "Jenny",
        case_manager: "Janet Morris",
        gender: 'Female',
        birthDate: '15/08/2000',
        language: 'English',
        phone: '1010101010',
        email: 'placeholder@placeholder.com',
        isActive: false,
        family: "James Shrader",

      }
    ];
    return Promise.resolve(lists)
  }

  getChildDetails() {
    const details = {
      id: '14',
      first_name: "Halsey",
      last_name: "Ray",
      childId: "25b562183e6f45d8aa1f24c3936921d3",
      organization: " The Smiling Kids ",
      care_giver_id: "837wsx",
      caregiver: "Shelley",
      case_manager: "Keeley Owen",
      gender: 'Female',
      birthdate: '15-08-2001',
      phoneNumber: ' 9477263850',
      email: 'halseyray@gmail.com',
      language: 'English',
      isVerified: true
    }
    return Promise.resolve(details);
  }

  getFamilyList() {
    const invoices = [
      {
        id: 'John Doe',
        currency: '$',
        description: 'Caregiver (Primary)',
        relationship: 'Uncle',
        // issueDate: now.getTime(),
        paymentMethod: 'johndoe@gmail.com',
        status: 'active',
        value: 5.25
      },
      {
        id: 'Jane Doe',
        currency: '$',
        description: 'Other',
        relationship: 'Aunt',
        // issueDate: now.getTime(),
        paymentMethod: 'janedoe@gmail.com',
        status: 'active',
        value: 5.25
      },
      {
        id: 'Janice Doe',
        currency: '$',
        description: 'Other',
        relationship: 'Cousin',
        // issueDate: now.getTime(),
        paymentMethod: 'janicedoe@gmail.com',
        status: 'active',
        value: 5.25
      }
    ];

    return Promise.resolve(invoices);
  }
}



export const customerApi = new CustomerApi();
