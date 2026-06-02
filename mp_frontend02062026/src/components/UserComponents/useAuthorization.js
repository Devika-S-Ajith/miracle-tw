// hooks/useAuthorization.js
import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizationConfig } from '../../assets/authorizationConfig';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';

// These objects live outside the hook and persist as long as the app is running
const globalAuthCache = {};
let depricationDataCache = null;
let depricationDataCacheTime = 0;

const useAuthorization = (module) => {
    // Periodic deprecation check (every 5 minutes)
    // Only set up once per app instance
    if (typeof window !== 'undefined' && !window.__TW_DEPRECATION_INTERVAL__) {
      window.__TW_DEPRECATION_INTERVAL__ = setInterval(async () => {
        try {
          const res = await getDepricationData();
          if (res?.type === 'APP_DEPRICATED') {
            window.location.href = '/maintenance';
          } else {
            depricationDataCache = res;
            depricationDataCacheTime = Date.now();
          }
        } catch (e) {
          // ignore errors
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState('loading');

  const { 
    signedinUserRoleHT, 
    signedinUserRoleFS, 
    getDepricationData 
  } = useContext(CommonDataContext);

  const checkAuth = useCallback(async () => {
    const organizationType = localStorage.getItem("signedinOrgType");

    // 1. Generate a unique key based on current state
    const cacheKey = `${module}_${signedinUserRoleHT}_${signedinUserRoleFS}_${organizationType}`;
    console.log("Checking auth for key:", cacheKey, globalAuthCache);
    // 2. Return cached result if it exists
    if (globalAuthCache[cacheKey]) {
      setAuthStatus(globalAuthCache[cacheKey]);
      return;
    }

    // GATEKEEPER: Don't check if roles are missing
    if (!signedinUserRoleHT && !signedinUserRoleFS) {
      setAuthStatus('loading');
      return;
    }

    setAuthStatus('loading');

    try {
      // Cache deprication data for 5 minutes
      let res = depricationDataCache;
      const now = Date.now();
      if (!res || (now - depricationDataCacheTime > 5 * 60 * 1000)) {
        res = await getDepricationData();
        depricationDataCache = res;
        depricationDataCacheTime = now;
      }

      if (res?.type === 'APP_DEPRICATED') {
        navigate('/maintenance');
        return;
      }

      let status = 'unauthorized';

      if (module === 'SYSTEM_MESSAGES') {
        const isSuperAdmin = signedinUserRoleHT === 'superadmin' || signedinUserRoleFS === 'superadmin';
        status = isSuperAdmin ? 'authorized' : 'unauthorized';
      } else {
        const moduleConfig = authorizationConfig[module];
        if (moduleConfig) {
          const { allowedRoles, allowedOrgTypes, allowedRolesFS } = moduleConfig;

          const hasValidHT = allowedRoles?.includes(signedinUserRoleHT) && 
                             allowedOrgTypes?.includes(organizationType);
          const hasValidFS = allowedRolesFS?.includes(signedinUserRoleFS);

          if (hasValidHT || hasValidFS) {
            status = 'authorized';
          }
        }
      }

      // 3. Save to the global cache
      globalAuthCache[cacheKey] = status;
      setAuthStatus(status);

      if (status === 'unauthorized') {
        navigate('/Unauthorized');
      }

    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus('unauthorized');
    }
  }, [module, signedinUserRoleHT, signedinUserRoleFS, navigate, getDepricationData]);

  return { authStatus, checkAuth };
};

export default useAuthorization;