import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizationConfig } from '../../assets/authorizationConfig'
import { CommonDataContext } from '../../common/contexts/CommonDataContext';


const useAuthorization = (userRoleHT, userRoleFS, orgType, module, isTS) => {
  const navigate = useNavigate();
 
  const { getDepricationData } = useContext(CommonDataContext);

  useEffect(() => {
    getDepricationData().then((res) => {
      if (res?.type === 'APP_DEPRICATED') {
        navigate('/maintenance');
      } else {

        if (module === "SYSTEM_MESSAGES" || module === "AddAccount") {
          if (['superadmin'].includes(userRoleHT) || ['superadmin'].includes(userRoleFS)) {
            return
          } else {
            navigate('/Unauthorized');
          }
        }

        if (isTS) {
          if (userRoleHT) {
            if (userRoleHT === 'unassigned') {
              navigate('/Unauthorized');
            } else if (userRoleHT && orgType) {
              const moduleConfig = authorizationConfig[module];
              if (!moduleConfig) {
                throw new Error(`Authorization config not found for module: ${module}`);
              }
              const { allowedRoles, allowedOrgTypes } = moduleConfig;
              const isAuthorized = (allowedOrgTypes?.includes(orgType) && allowedRoles?.includes(userRoleHT));

              if (!isAuthorized) {
                navigate('/Unauthorized');
              }
            } else {
              return
            }

          } else {
            //return
          }
        } else {
          if (userRoleFS) {
            const moduleConfig = authorizationConfig[module];
            if (!moduleConfig) {
              throw new Error(`Authorization config not found for module: ${module}`);
            }
            const { allowedRolesFS } = moduleConfig;
            const isAuthorized = allowedRolesFS?.includes(userRoleFS);

            if (!isAuthorized) {
              navigate('/Unauthorized');
            }
          } else {
            return
          }

        }
      }
    })
  }, [module, orgType, userRoleHT, userRoleFS]);
};

export default useAuthorization;
