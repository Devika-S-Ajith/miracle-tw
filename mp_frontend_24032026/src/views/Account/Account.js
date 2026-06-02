import { useTranslation } from 'react-i18next';

const Account = () =>{
    const { t } = useTranslation(['common']);
    return(
        <div>
           {t('common:common.Account')}
        </div>
    )
    
    }
    export default Account