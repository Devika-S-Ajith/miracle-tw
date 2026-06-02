import { Suspense, lazy } from 'react';
//import { Navigate } from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen';
import MainLayout from './layouts/MainLayout/MainLayout';
import DashboardLayout from './views/Dashboard';

const Loadable = (Component) => (props) => (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// Error pages

const AuthError = Loadable(lazy(() => import('./components/AuthError')));
const NotFoundError = Loadable(lazy(() => import('./components/NotFoundError')));
const ServerError = Loadable(lazy(() => import('./components/ServerError')));


  //authentication

  const Signin = Loadable(lazy(() => import('./views/Signin')));
  const ForgotPassword = Loadable(lazy(() => import('./views/ForgotPassword')));
  const NewPassword = Loadable(lazy(() => import('./views/NewPassword')));
  const Register = Loadable(lazy(() => import('./views/Register')));
  const PrivacyPolicy = Loadable(lazy(() => import('./views/PrivacyPolicy')));
  const TermsOfUse = Loadable(lazy(() => import('./views/TermsOfUse')));
  const Overview = Loadable(lazy(() => import('./views/Dashboard/Overview')));
  const Reports = Loadable(lazy(() => import('./views/Dashboard/Reports')));
  const ReportsChildWithRedFlag = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsChildWithRedFlag')));
  const ReportsChildServed = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsChildServed')));
  const DisruptionCases = Loadable(lazy(() => import('./views/Dashboard/Reports/DisruptionCases')));
  const AverageThriveScaleScore = Loadable(lazy(() => import('./views/Dashboard/Reports/AverageThriveScaleScore')));
  const ReportsDaysofFollowup = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsDaysofFollowup')));
  const ReportsNewlyAddedChildren = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsNewlyAddedChildren')));
  const ReportsCaseManagement = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsChildrenInCaseManagement')));
  const ReportsChildrenOverdue = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsChildrenOverdue.js')));
  const ReportsProgressReport = Loadable(lazy(() => import('./views/Dashboard/Reports/ProgressReport.js')));
  const ReportsDurationInCCI = Loadable(
    lazy(() =>
      import("./views/Dashboard/Reports/DurationInCCI")
    )
  );
  const ReportsReintegratedChildren = Loadable(
    lazy(() =>
      import("./views/Dashboard/Reports/ReportReintegratedChildren")
    )
  );

  const ReportsNewlyAdded = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsNewlyAdded')));
  const ReportsAverageChangeInThriveScale = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsAverageChangeInThriveScale')));
  
  const ChildrenInCCI = Loadable(lazy(() => import('./views/Dashboard/Reports/ChildrenInCCI')));
  const ReportsCurrentPlacement = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsCurrentPlacement')));
  const ReportsChildStatus = Loadable(lazy(() => import('./views/Dashboard/Reports/ReportsChildStatus')));
  const Calendar = Loadable(lazy(() => import('./views/Dashboard/Calendar')));
  //const ImportLayout = Loadable(lazy(() => import('./views/Import/ImportLayout')));
  const OrganizationList = Loadable(lazy(() => import('./views/Organization/OrganizationList')));
  const EditOrganization = Loadable(lazy(() => import('./views/Organization/EditOrganization')));
  const OrganizationDetails = Loadable(lazy(() => import('./views/Organization/OrganizationDetails')));
  const AddOrganization = Loadable(lazy(() => import('./views/Organization/AddOrganization')));
  const OrganizationImport = Loadable(lazy(() => import('./views/Organization/OrganizationImport')));
  const Account = Loadable(lazy(() => import('./views/Account')));
  const UserDetails = Loadable(lazy(() => import('./views/User/UserDetails')));
  const UserList = Loadable(lazy(() => import('./views/User/UserList')));
  const AddUser = Loadable(lazy(() => import('./views/User/AddUser')));
  const EditUser = Loadable(lazy(() => import('./views/User/EditUser')));
  const UserImport = Loadable(lazy(() => import('./views/User/UserImport')));

  const ChildList = Loadable(lazy(() => import('./views/Child/ChildList')));
  const ChildDetails = Loadable(lazy(() => import('./views/Child/ChildDetails')));
  const AddChild = Loadable(lazy(() => import('./views/Child/AddChild')));
  const EditChild = Loadable(lazy(() => import('./views/Child/EditChild')));
  const ChildImport = Loadable(lazy(() => import('./views/Child/ChildImport')));
 
  const FamilyList = Loadable(lazy(() => import('./views/Family/FamilyList')));
  const FamilyDetails = Loadable(lazy(() => import('./views/Family/FamilyDetails')));
  const AddFamily = Loadable(lazy(() => import('./views/Family/AddFamily')));
  const EditFamily = Loadable(lazy(() => import('./views/Family/EditFamily')));
  const EditMember = Loadable(lazy(() => import('./views/Family/EditMember')));
  const MemberDetails = Loadable(lazy(() => import('./views/Family/MemberDetails')));
  //const OtherMemberDetails = Loadable(lazy(() => import('./views/Family/OtherMemberDetails')));
  //const EditOtherMember = Loadable(lazy(() => import('./views/Family/EditOtherMember')));
  const FamilyImport = Loadable(lazy(() => import('./views/Family/FamilyImport')));

  const AssesmentList = Loadable(lazy(() => import('./views/Assessments/AssessmentList')));
  const AddAssessment = Loadable(lazy(() => import('./views/Assessments/AddAssessment')));

  const CaseList = Loadable(lazy(() => import('./views/Case/CaseList')));
  const AddCase = Loadable(lazy(() => import('./views/Case/AddCase')));
  const EditCase = Loadable(lazy(() => import('./views/Case/EditCase')));
  const CaseDetails = Loadable(lazy(()=>import('./views/Case/CaseDetails')));

  const AddQuestion = Loadable(lazy(() => import('./views/Questions/AddQuestion')));
  const EditQuestion = Loadable(lazy(() => import('./views/Questions/EditQuestion')));
  const AddCustomQuestion = Loadable(lazy(() => import('./views/Questions/AddCustomQuestion')));
  const QuestionList = Loadable(lazy(() => import('./views/Questions/QuestionList')));
  const QuestionDetails = Loadable(lazy(() => import('./views/Questions/QuestionDetails')));

  const FormList = Loadable(lazy(() => import('./views/Forms/FormList')));
  const ManageForm = Loadable(lazy(() => import('./views/Forms/ManageForm')));
  const PreviewForm = Loadable(lazy(() => import('./views/Forms/PreviewForm')));
  const MyProfile = Loadable(lazy(() => import('./views/Profile/ProfileSettings')));
  const ChangePassword = Loadable(lazy(() => import('./views/ChangePassword/ChangePassword')));
  const FormNaming = Loadable(lazy(() => import('./views/Forms/FormNaming')));
  const BuildForm = Loadable(lazy(() => import('./views/Forms/FormBuilder')));
  const ConfirmPublishForm = Loadable(lazy(() => import('./views/Forms/Components/confirmOperation')));
  const SuccessfullyPublished = Loadable(lazy(() => import('./views/Forms/Components/successFullMessage')));
  

  const routes = [
    // {
    //   path: '/',
    //   element: (
    //     // <AuthGuard>
    //       <Signin />
    //     // </AuthGuard>
    //   )
    // },
    {
      path: '/',
      element: (
      <MainLayout />
      ),
      children: [
        {
          path: '/',
          element: (
            // <GuestGuard>
              <Signin />
            // </GuestGuard>
          )
        },
        {
          path: '/forgot_password',
          element: (
            // <GuestGuard>
              <ForgotPassword />
            // </GuestGuard>
          )
        },
        {
          path: '/new_password',
          element: (
            // <GuestGuard>
              <NewPassword />
            // </GuestGuard>
          )
        },
        {
          path: 'signin',
          element: (
            // <GuestGuard>
              <Signin />
            // </GuestGuard>
          )
        },
        {
          path: 'login-unguarded',
          element: <Signin />
        },
        {
          path: 'register',
          element: (
            // <GuestGuard>
              <Register />
            // </GuestGuard>
          )
        },
        {
          path: '/Unauthorized',
          element: (
            // <GuestGuard>
            <AuthError />
            // </GuestGuard>
          )
        },
        {
          path: 'privacy',
          element: (
            // <GuestGuard>
              <PrivacyPolicy />
            // </GuestGuard>
          )
        },
        {
          path: 'terms',
          element: (
            // <GuestGuard>
              <TermsOfUse />
            // </GuestGuard>
          )
        },
        {
          path: '*',
          element: (
            // <GuestGuard>
            <NotFoundError />
            // </GuestGuard>
          )
        }
      ]
    },
    {
      path: 'dashboard',
      element: (
        // <AuthGuard>
          <DashboardLayout />
        // </AuthGuard>
      ),
      children: [
        {
          path: '/',
          element: <Overview />
        },
        {
          path: 'account',
          element: <Account />
        },
        {
          path: 'profile',
          element: <MyProfile />
        },
        // {
        //   path: 'finance',
        //   element: <Overview />
        // },
        {
          path: 'changePassword',
          element: <ChangePassword/>
        },        
        {
          path: 'reports',
          element: <Reports />
        },
        {
          path: 'reportsChildRedFlag',
          element: <ReportsChildWithRedFlag/>
        },
        {
          path: 'reportsChildServed',
          element: <ReportsChildServed/>
        },
        {
          path: 'disruptionCases',
          element: <DisruptionCases/>
        },
        {
          path: 'averageThriveScore',
          element: <AverageThriveScaleScore/>
        },
        {
          path: 'reportsDaysofFollowup',
          element: <ReportsDaysofFollowup/>
        },
        {
          path: 'reportsChildrenOverdue',
          element: <ReportsChildrenOverdue/>
        },
        {
          path: 'reportsNewlyAddeddChildren',
          element: <ReportsNewlyAddedChildren/>
        },
        {
          path: 'reportsCaseManagement',
          element: <ReportsCaseManagement/>
        },
        {
          path: 'reportsChildrenInCCI',
          element: <ChildrenInCCI/>
        },
        {
          path: 'reportsCurrentPlacement',
          element: <ReportsCurrentPlacement/>
        },
        {
          path: "durationInCCI",
          element: <ReportsDurationInCCI />,
        },
        {
          path: "ReintegratedChildren",
          element: <ReportsReintegratedChildren />,
        },
        {
          path: "NewlyAdded",
          element: <ReportsNewlyAdded />,
        },
        {
          path: "reportsAverageChange",
          element: <ReportsAverageChangeInThriveScale />,
        },
        {
        path: "reportsChildStatus",
        element: <ReportsChildStatus />,
        },
        {
          path: "ProgressReport",
          element: <ReportsProgressReport />,
          },
        {
          path: 'calendar',
          element: <Calendar />
        },
        {
          path: 'users',
          children: [
            {
              path: '/',
              element: <UserList />
            },
            {
              path: '/:id/view',
              element: <UserDetails />
            },
            {
              path: '/:id/edit',
              element: <EditUser />
            },
            {
              path: 'add',
              element: <AddUser />
            },
            
            {
              path: '/:id/add',
              element: <AddUser />
            },
            {
              path: '/import',
              element: <UserImport/>
             // element: <ImportLayout/>
            },
          ]
        },
        {
          path: 'child',
          children: [
            {
              path: '/',
              element: <ChildList />
            },
            {
              path: '/:id/view',
              element: <ChildDetails />
            },
            {
              path: '/:id/edit',
              element: <EditChild />
            },
            {
              path: '/import',
              element: <ChildImport/>
            },
            {
              path: 'add',
              element: <AddChild />
            }
          ]
        },
         {
          path: 'organizations',
          children: [
            {
              path: '/',
              element: <OrganizationList />
            },
            {
              path: '/:id/view',
              element: <OrganizationDetails />
            },
            {
              path: '/add',
              element: <AddOrganization />
            },
            {
              path: '/import',
              element: <OrganizationImport/>
            },
            {
              path: '/:id/edit',
              element: <EditOrganization />
            }
          ]
        },
        {
          path: 'family',
          children: [
            {
              path: '/',
              element: <FamilyList />
            },
            {
              path: '/:id/view',
              element: <FamilyDetails />
            },
            {
              path: '/add',
              element: <AddFamily />
            },
            {
              path: '/add/:id',
              element: <AddFamily />
            },
            {
              path: '/import',
              element: <FamilyImport/>
            },
            {
              path: '/:id/edit',
              element: <EditFamily />
            },
            {
              path: '/member/:id/edit',
              element: <EditMember />
            },
            {
              path: '/member/:id/view',
              element: <MemberDetails />
            }
          ]
        },
        {
          path: 'forms',
          children: [
            {
              path: '/',
              element: <FormList />
            },
            // {
            //   path: '/import',
            //   element: <ImportLayout/>
            // },
            {
              path: '/:id/manage',
              element: <ManageForm />
            },
            {
              path: '/:id/preview',
              element: <PreviewForm />
            },
            {
              path: '/add',
              element: <FormNaming />
            },
            {
              path: '/buildform',
              element: <BuildForm />
            },
            {
              path: '/confirmformpublish',
              element: <ConfirmPublishForm />
            },
            {
              path: '/formsuccessfullypublished',
              element: <SuccessfullyPublished />
            },
            
            
          ]
        },

        {
          path: 'questions',
          children: [
            {
              path: '/',
              element: <QuestionList />
            },
            {
              path: '/add',
              element: <AddQuestion />
            },
            {
              path: '/addCustomQuestion',
              element: <AddCustomQuestion/>
            },
            {
              path: '/editCustomQuestion/:questionId',
              element: <AddCustomQuestion/>
            },
            {
              path: '/:id/edit',
              element: <EditQuestion />
            },
            {
              path: '/:id/view',
              element: <QuestionDetails />
            },
          ]},

          
          {
          path: 'assessments',
          children: [
            {
              path: '/',
              element: <AssesmentList />
            },
            {
              path: '/add',
              element: <AddAssessment />
            },
            // {
            //   path: '/import',
            //   element: <ImportLayout/>
            // },
            {
              path: '/:id/view',
              element: <AddAssessment />
            },
            {
              path: '/:id/edit',
              element: <AddAssessment />
            },
          ]
        },


        {
          path: 'cases',
          children: [
            {
              path: '/',
              element: <CaseList />
            },
            {
              path: '/add',
              element: <AddCase />
            },
            // {
            //   path: '/import',
            //   element: <ImportLayout/>
            // },
            {
              path: '/:id/view',
              element: <CaseDetails />
            },
            {
              path: '/:id/edit',
              element: <EditCase />
            }
          ]
        },

      ]
    },
    // {
    //   path: '*',
    //   element: <MainLayout />,
    //   children: [
    //     {
    //       path: '401',
    //       element: <AuthError />
    //     },
    //     {
    //       path: '404',
    //       element: <NotFoundError />
    //     },
    //     {
    //       path: '500',
    //       element: <ServerError />
    //     },
    //     {
    //       path: '*',
    //       element: <NotFound />
    //     }
    //   ]
    // }
  ];
  
  export default routes;