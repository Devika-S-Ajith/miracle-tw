import BoldArrow from "../../../../assets/icons/BoldArrow";
import { MoodImageMapping } from "../../Components/StateGovDashboardComponents/MoodImageMapping";

const MoodImprovement = ({ fromEmoji, toEmoji, altFrom = 'From Mood', altTo = 'To Mood', size = 25 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <img
            src={MoodImageMapping[fromEmoji]}
            alt={altFrom}
            width={size}
            height={size}
            style={{ objectFit: 'contain' }}
        />
        { <>
            <BoldArrow />
            <img
                src={MoodImageMapping[toEmoji]}
                alt={altTo}
                width={size}
                height={size}
                style={{ objectFit: 'contain' }}
            />
        </>
        }
    </div>
);

//  <img
//               src="/static/icons/inCrisisIcon.png"
//               style={{ width: 20, height: 20 }}
//             />
//             <img
//               src="/static/icons/safeIcon.png"
//               style={{ width: 20, height: 20 }}
//             />
//             <img
//               src="/static/icons/thrivingIcon.png"
//               style={{ width: 20, height: 20 }}
//             />
//             <img
//               src="/static/icons/vulnerableIcon.png"
//               style={{ width: 20, height: 20 }}
//             />

export default MoodImprovement;