import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Typography
} from "@mui/material";
import toast from "react-hot-toast";
import './Maintenance.css';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';
import Loader from '../../components/UserComponents/Loader';


const VerifyAccount = () => {

	const [loading, setLoading] = useState(false);
	const [displayTitle, setDisplayTitle] = useState("")
	const [displayMessage, setDisplayMessage] = useState("")
	const [messageLink, setMessageLink] = useState(null)
	const [blackoutEndOn, setBlackoutEndOn] = useState(null)
	const navigate = useNavigate()
	const { getDepricationData } = useContext(CommonDataContext);

	useEffect(() => {
		checkAppDeprication()
	}, []);
	
	const formatBlackoutEndOnTime = (blackoutEndOn) => {
		const formattedBlackoutEndOn = new Date(blackoutEndOn).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}) + ', ' + new Date(blackoutEndOn).toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true // Use 12-hour format with AM/PM
		})
		return formattedBlackoutEndOn;
		
  };

	const checkAppDeprication = async () => {
		try {
			setLoading(true)
			getDepricationData().then(res => {
				if (res?.type === 'APP_DEPRICATED') {
					setDisplayTitle(res?.title)
					setDisplayMessage(res?.message)
					setMessageLink(res?.webLink)
					setBlackoutEndOn(res?.blackoutEndOn ? formatBlackoutEndOnTime(res?.blackoutEndOn) : null)
					setLoading(false)
				} else {
					navigate('/');
				}
			})
		} catch (err) {
			toast.error("Something went wrong");
		}
	};

	return (
		<div className="App">
			<div className="background">
				<div className="content">
					{loading ?
						<Loader loading={loading}></Loader>
						: <Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								color: 'white',
								mx: 'auto', // Center the box horizontally
							}}
						>
							<Box
								sx={{
									margin: "auto",
									maxWidth: "300px",
									mb: 6,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<img
									alt="Miracle Foundation Logo"
									src="/static/WhiteLogoStraightTW.png"
									style={{
										width: "30.125rem",
										height: "5.8625rem"
									}}
								/>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 6, width: '100%', justifyContent: 'center' }}>
								<Typography sx={{ color: '#F2EEE6', textAlign: 'center', fontSize: '2rem', fontWeight: 700 }}>
									{displayTitle || "We're down for maintenance"}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 6, width: '100%', justifyContent: 'center', maxWidth: '800px' }}>
								<Typography sx={{ color: '#F2EEE6', textAlign: 'center', fontSize: '1.5rem' }}>
									{displayMessage || (
										!messageLink ? (
											`Our site is temporarily unavailable and will be back ${blackoutEndOn ? `on ${blackoutEndOn}` : 'soon.'
											}`
										) : (
											<>
												Our site is temporarily unavailable.
												If you need to, you can always{' '}
												<a
													href={messageLink}
													target="_blank"
													style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
												>
													contact us
												</a>
												. Otherwise, we'll be back {
													blackoutEndOn ? `on ${blackoutEndOn}` : 'online shortly!'
												}
											</>
										)
									)}

								</Typography>
							</Box>
						</Box>
					}
				</div>
			</div>
		</div>
	);
}

export default VerifyAccount;
