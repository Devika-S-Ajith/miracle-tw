import PropTypes from "prop-types";
import RatingComponent from "../../../../components/RatingComponent/RatingComponent";



const RatingWithValue = ({ rating, interventionCount }) => (
    <span style={{ display: "flex", alignItems: "center" }}>
        <span>
            <RatingComponent rating={rating} readOnly={true} />
        </span>
        <span style={{ paddingLeft: 8 }}>{interventionCount}</span>
    </span>
);

RatingWithValue.propTypes = {
    rating: PropTypes.number.isRequired,
    interventionCount: PropTypes.number.isRequired,
};

export default RatingWithValue;