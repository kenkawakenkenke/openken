import "./heart.css";

function Heart({ bpm }) {

    const beatPeriod = 60 / bpm;

    const animationStyle = {
        "animation": `heartbeat ${beatPeriod}s infinite`,
    };
    return <div className="HeartRect">
        <div className="heart" style={animationStyle}></div>
    </div>
}
export default Heart;
