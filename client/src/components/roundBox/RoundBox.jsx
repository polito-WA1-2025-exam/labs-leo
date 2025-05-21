import './roundBox.css';
import PropTypes from 'prop-types';

function RoundBox(props){
    return(
        <>
            {
                props.match_details ? 
                    props.match_details.length === 3 || props.from === 'resume' ?
                    props.match_details.map((det, index) => {
                        
                        return(

                            <div className={'match-img-container ' + props.styles} key={index}>
                                <div className='pixel-corners--wrapper round-img-container'>
                                    <img src={det.meme.img_url} className='pixel-corners' />
                                </div>
                                <div className='round-details'>
                                    <p><span className='head-text'>Round:</span> <span className='font-garet'>{det.round}</span></p>
                                    <p><span className='head-text'>Points:</span> <span className={det.points === 5 ? 'color-green' : 'color-red'}>{det.points}</span></p>
                                    <p><span className='head-text'>Choice:</span> <span className='font-garet'>{det.selected_caption.text}</span></p>
                                    {
                                        
                                        det.correctCaption && props.from === 'resume'? 
                                        det.correctCaption.map((cap, index) => {
                                            return(
                                                <p key={index}><span className='head-text'>Correct {index + 1}:</span> <span className='font-garet'>{cap.text}</span></p>
                                            )
                                        })
                                        : ''
                                    }
                                </div>
                            </div>
                        )})
                    : 'Invalid Game'
                : 'Not able to load Resume! Please try again!'
            }
        </>
    )
}
RoundBox.propTypes = {
    match_details: PropTypes.array,
    from: PropTypes.string,
    styles: PropTypes.string
};

export default RoundBox;