import './info.css';
import PropTypes from "prop-types";

function ProfileInfo(props) {
    return (
        <div className='profile-info-container'>
            <div className='profile-card'>
                <div className='profile-header'>
                    <div className='avatar-container'>
                        <div className='avatar'>
                            <i className="bi bi-person-circle"></i>
                        </div>
                        <div className='user-badge'>
                            <i className="bi bi-star-fill"></i>
                            <span>{props.user.points}</span>
                        </div>
                    </div>
                    <h2 className='user-name'>{props.user.name}</h2>
                    <p className='user-email'>{props.user.username}</p>
                </div>
                
                <div className='stats-container'>
                    <div className='stat-item'>
                        <div className='stat-value'>{props.user.points}</div>
                        <div className='stat-label'>Total Points</div>
                    </div>
                    
                    <div className='stat-divider'></div>
                    
                    <div className='stat-item'>
                        <div className='stat-value'>
                            {Math.floor(props.user.points / 30)}
                        </div>
                        <div className='stat-label'>Games Won</div>
                    </div>
                    
                    <div className='stat-divider'></div>
                    
                    <div className='stat-item'>
                        <div className='stat-value'>
                            {props.user.points > 0 ? 
                                Math.floor(props.user.points / 10) : 0}
                        </div>
                        <div className='stat-label'>Correct Answers</div>
                    </div>
                </div>
                
                <div className='profile-achievements'>
                    <h3 className='achievements-title'>
                        <i className="bi bi-trophy"></i> Achievements
                    </h3>
                    
                    <div className='achievements-list'>
                        <div className={`achievement-item ${props.user.points >= 10 ? 'unlocked' : 'locked'}`}>
                            <div className='achievement-icon'>
                                <i className="bi bi-emoji-smile"></i>
                            </div>
                            <div className='achievement-info'>
                                <div className='achievement-name'>First Win</div>
                                <div className='achievement-desc'>Win your first game</div>
                            </div>
                        </div>
                        
                        <div className={`achievement-item ${props.user.points >= 50 ? 'unlocked' : 'locked'}`}>
                            <div className='achievement-icon'>
                                <i className="bi bi-emoji-sunglasses"></i>
                            </div>
                            <div className='achievement-info'>
                                <div className='achievement-name'>Meme Enthusiast</div>
                                <div className='achievement-desc'>Earn 50+ points</div>
                            </div>
                        </div>
                        
                        <div className={`achievement-item ${props.user.points >= 100 ? 'unlocked' : 'locked'}`}>
                            <div className='achievement-icon'>
                                <i className="bi bi-emoji-laughing"></i>
                            </div>
                            <div className='achievement-info'>
                                <div className='achievement-name'>Meme Master</div>
                                <div className='achievement-desc'>Earn 100+ points</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

ProfileInfo.propTypes = {
    user: PropTypes.object.isRequired,
};

export default ProfileInfo;