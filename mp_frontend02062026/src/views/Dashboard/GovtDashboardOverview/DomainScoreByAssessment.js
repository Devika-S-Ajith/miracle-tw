import {
    Typography,
} from '@mui/material';
import TrendingUp from '../../../assets/icons/TrendingUp';
import TrendingDown from '../../../assets/icons/TrendingDown';
import TrendingStraight from '../../../assets/icons/TrendingStraight';
import ReusableTrendTable from './Components/ReusableTrendTable';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { getDomainIcon } from './HelperFunctions/DashboardHelperFunction';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import { getNavbarFilterPayload } from '../../../constants';
import { useParams } from 'react-router';


const TableWithTrendLines = ({ isGeneralDashboard = false }) => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
    const [apiError, setApiError] = useState(false);
    const { t } = useTranslation(["common"]);

    const getDomainScoredByAssesment = useCallback(async () => {
        try {
            const payload = getNavbarFilterPayload(navbarFilterValues, linkedAccounts);
            if( payload.countryFilter === null) {
                return; 
            }
            if (id) {
                payload.accountFilter = [id];
            }
            if (isGeneralDashboard) {
                payload.accountFilter = [localStorage.getItem("orgId")];
            }
            setLoading(true);
            await APIS.DomainScoresAssessment(payload).then((resp) => {
                if (resp?.data?.data) {
                    setTableData(resp?.data?.data || []);
                    setLoading(false);
                }
            });
        } catch (error) {
            setApiError(true)
        } finally {
            setLoading(false);
        }
    },[navbarFilterValues, linkedAccounts, id,localStorage.getItem("userRegion")]);

    useEffect(() => {
        if (localStorage.getItem("userRegion")) {
            getDomainScoredByAssesment();
        }
    }, [navbarFilterValues, id, localStorage.getItem("userRegion")]);


    const getScoreChangeIcon = (score) => {
        const num = Number(score);
        if (num > 0)
            return <TrendingUp sx={{ fontSize: 27, mb: -1 }} />;
        if (num < 0)
            return <TrendingDown sx={{ fontSize: 27, mb: -1 }} />;
        return <TrendingStraight sx={{ fontSize: 27, mb: -1, transform: 'rotate(-90deg)' }} />;
    };


    const columnDefinition = [
        {
            label: "Domain",
            id: "domain",
            enableSorting: false,
            minWidth: 250,
            render: (row) => (
                <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 1 }}>
                        {getDomainIcon(row.domainId)}
                    </span>
                    <span style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {t(`common:common.${row?.domainName?.trim()}`)}
                    </span>
                </Typography>
            )
        },
        {
            label: "Average starting score",
            id: "averagestartingscore",
            enableSorting: false,
            render: (row) => (
                <Typography variant="body2" fontWeight="medium">
                    {row.averageStartingScore}%
                </Typography>
            )
        },
        {
            label: "Average score change",
            id: "averagescorechange",
            enableSorting: false,
            render: (row) => (
                <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 1 }}>
                        {getScoreChangeIcon(row.averageScoreChange)}
                    </span>
                    <span style={{ wordBreak: 'break-word', whiteSpace: 'normal'  }}>
                        {row.averageScoreChange}%
                    </span>
                </Typography>
            )
        },
    ];

    return (
        <ReusableTrendTable
            columns={columnDefinition}
            title="Domain scores by assessment"
            subheader="All active and closed families and children with at least 1 assessment"
            tableData={tableData}
            loading={loading}
            skeltonRowcount={6}
            apiError={apiError}
            onReload={() => getDomainScoredByAssesment()}
            t={t}
        />
    );
};

export default TableWithTrendLines;