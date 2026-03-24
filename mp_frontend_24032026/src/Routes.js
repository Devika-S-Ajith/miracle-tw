import React, { Suspense, lazy } from "react";

import LoadingScreen from "./components/LoadingScreen";
import MainLayout from "./layouts/MainLayout/MainLayout";
import DashboardLayout from "./views/Dashboard";
import ResourcesList from "./views/FS/Resources/ResourcesList";
import ResourceDetails from "./views/FS/Resources/ResourceDetails";
import NotificationsList from "./views/FS/Notifications/NotificationsList/NotificationsList.js";
import SupportServiceDetailsContainer from "./views/FS/SupportServices/SupportServiceDetails/SupportServiceDetailsContainer.js";
import FamilyDetailForm from "./views/FS/Components/FamilyDetailForm/FamilyDetailForm.js";

const Loadable = (Component) => (props) =>
(
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

// Error pages

const AuthError = Loadable(lazy(() => import("./components/AuthError")));
const NotFoundError = Loadable(
  lazy(() => import("./components/NotFoundError"))
);
const ServerError = Loadable(lazy(() => import("./components/ServerError")));

//authentication

const Signin = Loadable(lazy(() => import("./views/Signin")));
const ForgotPassword = Loadable(lazy(() => import("./views/ForgotPassword")));
const NewPassword = Loadable(lazy(() => import("./views/NewPassword")));
const Register = Loadable(lazy(() => import("./views/Register")));
const PrivacyPolicy = Loadable(lazy(() => import("./views/PrivacyPolicy")));
const TermsOfUse = Loadable(lazy(() => import("./views/TermsOfUse")));
const Overview = Loadable(lazy(() => import("./views/Dashboard/Overview")));
const Reports = Loadable(lazy(() => import("./views/Dashboard/Reports")));
const ReportsChildWithRedFlag = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsChildWithRedFlag"))
);
const ReportsFamilyWithRedFlag = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsFamilyWithRedFlag"))
);
const ReportsChildServed = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsChildServed"))
);
const ReportsFamilyServed = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsFamilyServed"))
);
const DisruptionCases = Loadable(
  lazy(() => import("./views/Dashboard/Reports/DisruptionCases"))
);
const AverageThriveScaleScore = Loadable(
  lazy(() => import("./views/Dashboard/Reports/AverageThriveScaleScore"))
);
const AverageThriveScaleScoreFamily = Loadable(
  lazy(() => import("./views/Dashboard/Reports/AverageThriveScaleScoreFamily"))
);
const ReportsDaysofFollowup = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsDaysofFollowup"))
);
const ReportsNewlyAddedChildren = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsNewlyAddedChildren"))
);
const ReportsCaseManagement = Loadable(
  lazy(() =>
    import("./views/Dashboard/Reports/ReportsChildrenInCaseManagement")
  )
);
const ReportsChildrenOverdue = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsChildrenOverdue.js"))
);
const ReportsProgressReport = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ProgressReport.js"))
);
const ProgressReportFamily = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ProgressReportFamily.js"))
);
const ReportsDurationInCCI = Loadable(
  lazy(() => import("./views/Dashboard/Reports/DurationInCCI"))
);
const ReportsReintegratedChildren = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportReintegratedChildren"))
);

const ReportsNewlyAdded = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsNewlyAdded"))
);
const ReportsNewlyAddedFamily = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsNewlyAddedFamily"))
);
const ReportsAverageChangeInThriveScale = Loadable(
  lazy(() =>
    import("./views/Dashboard/Reports/ReportsAverageChangeInThriveScale")
  )
);

const ChildrenInCCI = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ChildrenInCCI"))
);
const ReportsCurrentPlacement = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsCurrentPlacement"))
);
const ReportsChildStatus = Loadable(
  lazy(() => import("./views/Dashboard/Reports/ReportsChildStatus"))
);
const Calendar = Loadable(lazy(() => import("./views/Dashboard/Calendar")));
//const ImportLayout = Loadable(lazy(() => import('./views/Import/ImportLayout')));
const OrganizationList = Loadable(
  lazy(() => import("./views/Organization/OrganizationList"))
);
const EditOrganization = Loadable(
  lazy(() => import("./views/Organization/EditOrganization"))
);
const OrganizationDetails = Loadable(
  lazy(() => import("./views/Organization/OrganizationDetails"))
);
const AddOrganization = Loadable(
  lazy(() => import("./views/Organization/AddOrganization"))
);
const OrganizationImport = Loadable(
  lazy(() => import("./views/Organization/OrganizationImport"))
);
const Account = Loadable(lazy(() => import("./views/Account")));
const UserDetails = Loadable(lazy(() => import("./views/User/UserDetails")));
const UserList = Loadable(lazy(() => import("./views/User/UserList")));
const MessagesList = Loadable(
  lazy(() => import("./views/Messages/MessagesList"))
);
const MessageDetails = Loadable(
  lazy(() => import("./views/Messages/MessageDetails"))
);
const AddUser = Loadable(lazy(() => import("./views/User/AddUser")));
const ManageUser = Loadable(
  lazy(() => import("./views/User/ManageUser/index.js"))
);
const UserImport = Loadable(lazy(() => import("./views/User/UserImport")));

const ChildList = Loadable(lazy(() => import("./views/Child/ChildList")));
const ChildDetails = Loadable(lazy(() => import("./views/Child/ChildDetails")));
const AddChild = Loadable(lazy(() => import("./views/Child/AddChild")));
const EditChild = Loadable(lazy(() => import("./views/Child/EditChild")));
const ChildImport = Loadable(lazy(() => import("./views/Child/ChildImport")));

const FamilyList = Loadable(lazy(() => import("./views/Family/FamilyList")));
const FamilyDetails = Loadable(
  lazy(() => import("./views/Family/FamilyDetails"))
);
const AddFamily = Loadable(lazy(() => import("./views/Family/AddFamily")));
const EditFamily = Loadable(lazy(() => import("./views/Family/EditFamily")));
const EditMember = Loadable(lazy(() => import("./views/Family/EditMember")));
const MemberDetails = Loadable(
  lazy(() => import("./views/Family/MemberDetails"))
);
//const OtherMemberDetails = Loadable(lazy(() => import('./views/Family/OtherMemberDetails')));
//const EditOtherMember = Loadable(lazy(() => import('./views/Family/EditOtherMember')));
const FamilyImport = Loadable(
  lazy(() => import("./views/Family/FamilyImport"))
);

const AssesmentList = Loadable(
  lazy(() => import("./views/Assessments/AssessmentList"))
);
const AddAssessment = Loadable(
  lazy(() => import("./views/Assessments/AddAssessment"))
);

const CaseList = Loadable(lazy(() => import("./views/Case/CaseList")));
const AddCase = Loadable(lazy(() => import("./views/Case/AddCase")));
const EditCase = Loadable(lazy(() => import("./views/Case/EditCase")));
const CaseDetails = Loadable(lazy(() => import("./views/Case/CaseDetails")));

const AddQuestion = Loadable(
  lazy(() => import("./views/Questions/AddQuestion"))
);
const EditQuestion = Loadable(
  lazy(() => import("./views/Questions/EditQuestion"))
);
const AddCustomQuestion = Loadable(
  lazy(() => import("./views/Questions/AddCustomQuestion"))
);
const QuestionList = Loadable(
  lazy(() => import("./views/Questions/QuestionList"))
);
const QuestionDetails = Loadable(
  lazy(() => import("./views/Questions/QuestionDetails"))
);

const FormList = Loadable(lazy(() => import("./views/Forms/FormList")));
const ManageForm = Loadable(lazy(() => import("./views/Forms/ManageForm")));
const PreviewForm = Loadable(lazy(() => import("./views/Forms/PreviewForm")));
const MyProfile = Loadable(
  lazy(() => import("./views/Profile/ProfileSettings"))
);
const ChangePassword = Loadable(
  lazy(() => import("./views/ChangePassword/ChangePassword"))
);
const FormNaming = Loadable(lazy(() => import("./views/Forms/FormNaming")));
const BuildForm = Loadable(lazy(() => import("./views/Forms/FormBuilder")));
const ConfirmPublishForm = Loadable(
  lazy(() => import("./views/Forms/Components/confirmOperation"))
);
const SuccessfullyPublished = Loadable(
  lazy(() => import("./views/Forms/Components/successFullMessage"))
);

//Fostershare

const FamilyListFS = Loadable(
  lazy(() => import("./views/FS/Family/FamilyList"))
);
const ChildListFS = Loadable(lazy(() => import("./views/FS/Child/ChildList")));
const MessagesFS = Loadable(lazy(() => import("./views/FS/Messages")));
const EventsFS = Loadable(lazy(() => import("./views/FS/Events/EventsList")));
const FamilyDetailsFS = Loadable(
  lazy(() => import("./views/FS/Family/FamilyDetails"))
);
const ChildDetailsFS = Loadable(
  lazy(() => import("./views/FS/Child/ChildDetails"))
);
const SupportServicesFS = Loadable(
  lazy(() => import("./views/FS/SupportServices/SupportServicesList"))
);
const MedLogDetailsFS = Loadable(
  lazy(() => import("./views/FS/Components/MedLogDetails"))
);
const EventDetailsFS = Loadable(
  lazy(() => import("./views/FS/Events/EventDetails"))
);

const FSDashboard = Loadable(lazy(() => import("./views/FS/Dashboard")));
const LandingPage = Loadable(lazy(() => import("./views/Landing")));

const DisclosurePage = Loadable(lazy(() => import("./views/FS/DisclosurePage")))
const Download = Loadable(lazy(() => import("./views/Downloads")))
const VerifyAccount = Loadable(lazy(() => import("./views/VerifyAccount")))
const FaqsPage = Loadable(lazy(() => import("./views/Faqs")))
const Maintenance = Loadable(lazy(() => import("./views/Maintenance")))

// govt dashboard 
const GovtDashboardOverview = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardOverview"))
);
const GovtDashboardOrganizations = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardOrganizations"))
);
const GovtDashboardMilestones = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardMilestones")));
const GovtDashboardMilestoneDetails = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardMilestones/MilestoneDetails/MilestoneDetails.js")));
const GovtDashboardInterventions = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardInterventions"))
);
const GovtDashboardInterventionsDetails = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardInterventions/Components/InterventionDetailPage"))
);
const GovtDashboardFamily = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardFamily"))
);
const GovtDashboardChildren = Loadable(
  lazy(() => import("./views/Dashboard/GovtDashboardChild"))
);
const ConsolidatedEventsList = Loadable(
  lazy(() => import("./views/ConsolidatedEventsList"))
);


const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/forgot_password",
        element: (
          // <GuestGuard>
          <ForgotPassword />
          // </GuestGuard>
        ),
      },
      {
        path: "/new_password",
        element: (
          // <GuestGuard>
          <NewPassword />
          // </GuestGuard>
        ),
      },
      {
        path: "/disclosure",
        element: <DisclosurePage />,
      },
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "downloads",
        element: (
          // <GuestGuard>
          <Download />
          // </GuestGuard>
        ),
      },
      {
        path: "verify_account",
        element: (
          // <GuestGuard>
          <VerifyAccount />
          // </GuestGuard>
        ),
      },
      {
        path: "maintenance",
        element: (
          // <GuestGuard>
          <Maintenance />
          // </GuestGuard>
        ),
      },
      {
        path: "login-unguarded",
        element: <Signin />,
      },
      {
        path: "register",
        element: (
          // <GuestGuard>
          <Register />
          // </GuestGuard>
        ),
      },
      {
        path: "/Unauthorized",
        element: (
          // <GuestGuard>
          <AuthError />
          // </GuestGuard>
        ),
      },
      {
        path: "privacy",
        element: (
          // <GuestGuard>
          <PrivacyPolicy />
          // </GuestGuard>
        ),
      },
      {
        path: "terms",
        element: (
          // <GuestGuard>
          <TermsOfUse />
          // </GuestGuard>
        ),
      },
      {
        path: "faqs",
        element: (
          // <GuestGuard>
          <FaqsPage />
          // </GuestGuard>
        ),
      },
      {
        path: "*",
        element: (
          // <GuestGuard>
          <NotFoundError />
          // </GuestGuard>
        ),
      },
    ],
  },
  {
    path: "admin",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/team",
        element: <UserList />,
      },
      {
        path: "/organizations",
        element: <OrganizationList />,
      },
      {
        path: "/messages",
        // element: <MessagesList />,
        children: [
          {
            index: true,

            element: <MessagesList />,
          },
          {
            path: "/message-details",
            element: <MessageDetails />,
          },
          {
            path: "/message-details/:id",
            element: <MessageDetails />,
          },
        ],
      },
    ],
  },
  {
    path: "fostershare",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/dashboard",
        element: <FSDashboard />,
      },
      {
        path: "/families",
        element: <FamilyListFS />,
      },
      {
        path: "/families/family-details",
        element: <FamilyDetailForm />,
      },
      {
        path: "/families/family-details/:id",
        element: <FamilyDetailForm />,
      },
      {
        path: "/families/:id",
        element: <FamilyDetailsFS />,
      },
      {
        path: "/children",
        element: <ChildListFS />,
      },
      {
        path: "/children/:id/*",
        element: <ChildDetailsFS />,
        // loader:
      },
      {
        path: "/messages",
        element: <MessagesFS />,
      },
      {
        path: "/events",
        element: <EventsFS />,
      },
      {
        path: "/events/:id",
        element: <EventDetailsFS />,
      },
      {
        path: "/support-services",
        element: <SupportServicesFS />,
      },
      {
        path: "/support-services/:id",
        element: <SupportServiceDetailsContainer />,
      },
      {
        path: "/medlogs/:id",
        element: <MedLogDetailsFS />,
      },
      {
        path: "/resources",
        element: <ResourcesList />,
      },
      {
        path: "/resources/:id",
        element: <ResourceDetails />,
      },
      {
        path: "/notifications",
        element: <NotificationsList />,
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/",
        element: <Overview />,
      },
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "profile",
        element: <MyProfile />,
      },
      // {
      //   path: 'finance',
      //   element: <Overview />
      // },
      {
        path: "changePassword",
        element: <ChangePassword />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "reportsChildRedFlag",
        element: <ReportsChildWithRedFlag />,
      },
      {
        path: "reportFamilieswithRedFlags",
        element: <ReportsFamilyWithRedFlag />,
      },
      {
        path: "reportsChildServed",
        element: <ReportsChildServed />,
      },
      {
        path: "reportFamiliesServed",
        element: <ReportsFamilyServed />,
      },
      {
        path: "disruptionCases",
        element: <DisruptionCases />,
      },
      {
        path: "reportAverageThriveScoreChildren",
        element: <AverageThriveScaleScore />,
      },
      {
        path: "reportAverageThriveScaleScoresFamilies",
        element: <AverageThriveScaleScoreFamily />,
      },
      {
        path: "reportsDaysofFollowup",
        element: <ReportsDaysofFollowup />,
      },
      {
        path: "reportsChildrenOverdue",
        element: <ReportsChildrenOverdue />,
      },
      {
        path: "reportsNewlyAdmitedChildren",
        element: <ReportsNewlyAddedChildren />,
      },
      {
        path: "reportsCaseManagement",
        element: <ReportsCaseManagement />,
      },
      {
        path: "reportsChildrenInCCI",
        element: <ChildrenInCCI />,
      },
      {
        path: "reportsCurrentPlacement",
        element: <ReportsCurrentPlacement />,
      },
      {
        path: "durationInCCI",
        element: <ReportsDurationInCCI />,
      },
      {
        path: "reportReintegratedChildren",
        element: <ReportsReintegratedChildren />,
      },
      {
        path: "NewlyAdded",
        element: <ReportsNewlyAdded />,
      },
      {
        path: "NewlyAddedFamily",
        element: <ReportsNewlyAddedFamily />,
      },
      {
        path: "reportsAverageChangeInThriveScaleScore",
        element: <ReportsAverageChangeInThriveScale />,
      },
      {
        path: "reportsChildStatus",
        element: <ReportsChildStatus />,
      },
      {
        path: "progressReportChildren",
        element: <ReportsProgressReport />,
      },
      {
        path: "reportProgressReportsFamilies",
        element: <ProgressReportFamily />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "team",
        children: [
          {
            path: "/",
            element: <UserList />,
          },
          {
            path: "/:id/view",
            element: <UserDetails />,
          },
          {
            path: "/:id/edit",
            element: <ManageUser />,
          },
          {
            path: "add",
            element: <ManageUser />,
          },

          {
            path: "/:id/add",
            element: <AddUser />,
          },
          {
            path: "/import",
            element: <UserImport />,
            // element: <ImportLayout/>
          },
        ],
      },
      {
        path: "children",
        children: [
          {
            path: "/",
            element: <ChildList />,
          },
          {
            path: "/:id/view",
            element: <ChildDetails />,
          },
          {
            path: "/:id/edit",
            element: <EditChild />,
          },
          {
            path: "/import",
            element: <ChildImport />,
          },
          {
            path: "add",
            element: <AddChild />,
          },
        ],
      },
      {
        path: "/events",
        element: <ConsolidatedEventsList />,
      },

      {
        path: "organizations",
        children: [
          {
            path: "/",
            element: <OrganizationList />,
          },
          {
            path: "/:id/view",
            element: <OrganizationDetails />,
          },
          {
            path: "/add",
            element: <AddOrganization />,
          },
          {
            path: "/import",
            element: <OrganizationImport />,
          },
          {
            path: "/:id/edit",
            element: <EditOrganization />,
          },
        ],
      },
      {
        path: "families",
        children: [
          {
            path: "/",
            element: <FamilyList />,
          },
          {
            path: "/:id/view",
            element: <FamilyDetails />,
          },
          {
            path: "/add",
            element: <AddFamily />,
          },
          {
            path: "/add/:id",
            element: <AddFamily />,
          },
          {
            path: "/import",
            element: <FamilyImport />,
          },
          {
            path: "/:id/edit",
            element: <EditFamily />,
          },
          {
            path: "/member/:id/edit",
            element: <EditMember />,
          },
          {
            path: "/member/:id/view",
            element: <MemberDetails />,
          },
        ],
      },
      {
        path: "forms",
        children: [
          {
            path: "/",
            element: <FormList />,
          },
          // {
          //   path: '/import',
          //   element: <ImportLayout/>
          // },
          {
            path: "/:id/manage",
            element: <ManageForm />,
          },
          {
            path: "/:id/preview",
            element: <PreviewForm />,
          },
          {
            path: "/add",
            element: <FormNaming />,
          },
          {
            path: "/buildform",
            element: <BuildForm />,
          },
          {
            path: "/confirmformpublish",
            element: <ConfirmPublishForm />,
          },
          {
            path: "/formsuccessfullypublished",
            element: <SuccessfullyPublished />,
          },
        ],
      },

      {
        path: "questions",
        children: [
          {
            path: "/",
            element: <QuestionList />,
          },
          {
            path: "/add",
            element: <AddQuestion />,
          },
          {
            path: "/addCustomQuestion",
            element: <AddCustomQuestion />,
          },
          {
            path: "/editCustomQuestion/:questionId",
            element: <AddCustomQuestion />,
          },
          {
            path: "/:id/edit",
            element: <EditQuestion />,
          },
          {
            path: "/:id/view",
            element: <QuestionDetails />,
          },
        ],
      },

      {
        path: "assessments",
        children: [
          {
            path: "/",
            element: <AssesmentList />,
          },
          {
            path: "/add",
            element: <AddAssessment />,
          },
          // {
          //   path: '/import',
          //   element: <ImportLayout/>
          // },
          {
            path: "/:id/view",
            element: <AddAssessment />,
          },
          {
            path: "/:id/edit",
            element: <AddAssessment />,
          },
        ],
      },

      {
        path: "cases",
        children: [
          {
            path: "/",
            element: <CaseList />,
          },
          {
            path: "/add",
            element: <AddCase />,
          },
          // {
          //   path: '/import',
          //   element: <ImportLayout/>
          // },
          {
            path: "/:id/view",
            element: <CaseDetails />,
          },
          {
            path: "/:id/edit",
            element: <EditCase />,
          },
        ],
      },
      // {
      //   path: "fostershare",
      //   children: [
      //     {
      //       path: "/families",
      //       element: <FamilyListFS />,
      //     },
      //     {
      //       path: "/families/family-details",
      //       element: <FamilyDetailForm />,
      //     },
      //     {
      //       path: "/families/family-details/:id",
      //       element: <FamilyDetailForm />,
      //     },
      //     {
      //       path: "/families/:id",
      //       element: <FamilyDetailsFS />,
      //     },
      //     {
      //       path: "/children",
      //       element: <ChildListFS />,
      //     },
      //     {
      //       path: "/children/:id",
      //       element: <ChildDetailsFS />,
      //       // loader:
      //     },
      //     {
      //       path: "/messages",
      //       element: <MessagesFS />,
      //     },
      //     {
      //       path: "/events",
      //       element: <EventsFS />,
      //     },
      //     {
      //       path: "/events/:id",
      //       element: <EventDetailsFS />,
      //     },
      //     {
      //       path: "/support-services",
      //       element: <SupportServicesFS />,
      //     },
      //     {
      //       path: "/support-services/:id",
      //       element: <SupportServiceDetailsContainer />,
      //     },
      //     {
      //       path: "/medlogs/:id",
      //       element: <MedLogDetailsFS />,
      //     },
      //     {
      //       path: "/resources",
      //       element: <ResourcesList />,
      //     },
      //     {
      //       path: "/resources/:id",
      //       element: <ResourceDetails />,
      //     },
      //     {
      //       path: "/notifications",
      //       element: <NotificationsList />,
      //     },
      //   ],
      // },
    ],
  },
   {
    path: "governmentDashboardOverview",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/",
        element: <GovtDashboardOverview />,
      }
    ]
  },
  {
    path: "governmentDashboardOrganizations",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/",
        element: <GovtDashboardOrganizations />, 
      },
      {
        path: "/:id",
        element: <GovtDashboardOverview />,
      } 
    ]
  },
    {
    path: "governmentDashboardMilestones",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "/",
        element: <GovtDashboardMilestones />,
      },
      {
        path: "/:id",
        element: <GovtDashboardMilestoneDetails />,
      }
    ]
  },
  {
    path: "governmentDashboardInterventions",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      //
      //  </AuthGuard>
    ),
    children: [
      { 
        path: "/",
        element: <GovtDashboardInterventions />,
     },
     {
        path: "/:id",
        element: <GovtDashboardInterventionsDetails />,
      }
    ]
  },
  {
    path: "governmentDashboardFamily",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      //
      //  </AuthGuard>
    ),
    children: [
      { 
        path: "/",
        element: <GovtDashboardFamily />,
     },
    ]
  },
  {
    path: "governmentDashboardChildren",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      //  </AuthGuard>
    ),
    children: [
      { 
        path: "/",
        element: <GovtDashboardChildren />,
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
