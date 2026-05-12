import { useContext, useMemo } from "react";
import { CommonDataContext } from "../../common/contexts/CommonDataContext";
import { ADMIN,ADMIN_CASEWORKER,CASEWORKER,VIEW_ONLY } from "../../helpers/constant";


const useCRUDPermissions = () => {
  const { signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);

  return useMemo(() => {
    // Helper for "View" access
    const viewRoles = [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY];
    // Helper for "Write/Edit" access (Excludes VIEW_ONLY)
    const editRoles = [ADMIN, CASEWORKER, ADMIN_CASEWORKER];

    const IS_FS_ALLOWED = viewRoles.includes(signedinUserRoleFS);
    const IS_HT_ALLOWED = viewRoles.includes(signedinUserRoleHT);
    
    const IS_EDIT_ALLOWED_FS = editRoles.includes(signedinUserRoleFS);
    const IS_EDIT_ALLOWED_HT = editRoles.includes(signedinUserRoleHT);

    return {
      // Viewing Rights
      IS_FS_ALLOWED,
      IS_HT_ALLOWED,
      BOTH_FS_HT_ALLOWED: IS_FS_ALLOWED || IS_HT_ALLOWED,

      // Editing Rights
      IS_EDIT_ALLOWED_FS,
      IS_EDIT_ALLOWED_HT,
      IS_EDIT_ALLOWED: IS_EDIT_ALLOWED_HT || IS_EDIT_ALLOWED_FS,
      
      // Extended CRUD (Examples)
      CAN_CREATE: IS_EDIT_ALLOWED_HT || IS_EDIT_ALLOWED_FS,
      CAN_DELETE: IS_EDIT_ALLOWED_HT || IS_EDIT_ALLOWED_FS
    };
  }, [signedinUserRoleHT, signedinUserRoleFS]);
};

export default useCRUDPermissions;