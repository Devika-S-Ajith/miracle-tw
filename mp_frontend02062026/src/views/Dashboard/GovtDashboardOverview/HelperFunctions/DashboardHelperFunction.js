import HouseholdEconomy from '../../../../assets/icons/DomainRoundedIcons/HouseholdEconomy';
import LivingCondition from '../../../../assets/icons/DomainRoundedIcons/LivingCondition';
import Education from '../../../../assets/icons/DomainRoundedIcons/Education';
import FamilyAndSocialRelationships from '../../../../assets/icons/DomainRoundedIcons/FamilyAndSocialRelationships';
import HealthAndMentalHealth from '../../../../assets/icons/DomainRoundedIcons/HealthAndMentalHealth';
import TrendingUp from '../../../../assets/icons/TrendingUp';
import TrendingDown from '../../../../assets/icons/TrendingDown';

export const getDomainIcon = (DomainIdx) => {
    if (DomainIdx == 1)
    return <FamilyAndSocialRelationships sx={{ fontSize: 27, mb: -1 , mr:1 }} />;
    if (DomainIdx == 2)
    return <HouseholdEconomy sx={{ fontSize: 27, mb: -1, mr:1 }} />;
    if (DomainIdx == 3)
    return <LivingCondition sx={{ fontSize: 27, mb: -1, mr:1 }} />; 
    if (DomainIdx == 4)
    return <Education sx={{ fontSize: 27, mb: -1, mr:1 }} />;    
    if (DomainIdx == 5)
    return <HealthAndMentalHealth sx={{ fontSize: 27, mb: -1, mr:1 }} />;
};

export const getScoreChangeIcon = (score) => {
    const num = Number(score);
    if (num > 0)
        return <TrendingUp sx={{ fontSize: 18, mb: -1 }} />;
    if (num < 0)
        return <TrendingDown sx={{ fontSize: 18, mb: -1 }} />;
    // Instead of TrendingStraight, show a midnight-colored em-dash
    return <span style={{ color: '#191970', fontSize: 18, verticalAlign: 'middle' }}>&mdash;</span>;
};