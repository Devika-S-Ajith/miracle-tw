import { Backdrop, Box, Button, Modal, Typography } from "@mui/material";
import React from "react";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	border: "none",
	outline: "none",
	boxShadow: 24,
	p: 4,
};

const PopupMessage = ({ open, handleclose, subject, content, availableActions }) => {
	return (
		<>
			<Backdrop
				sx={{
					zIndex: (theme) => theme.zIndex.modal - 1,
					backdropFilter: "blur(4px)",
				}}
				open={open}
			/>
			<Modal
				open={open}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2" mt>
						{subject}
					</Typography>
					<Typography
						id="modal-modal-description"
						sx={{
							my: 2,
							overflowWrap:
								"break-word" /* Ensures long words break properly */,
							hyphens:
								"auto" /* Automatically adds hyphens where necessary */,
						}}>
						{typeof content === 'string' && content.includes('<') && content.includes('>')
							? <div dangerouslySetInnerHTML={{ __html: content }} />
							: content}
					</Typography>
					<div style={{ display: 'flex' }}>
						<Button
							id="close"
							sx={{ width: availableActions?.length ? 0.5 : 1, mr: 1 }}
							variant="outlined"
							onClick={handleclose}>
							Close
						</Button>
						{availableActions?.length ?
							<Button
								id="action-button"
								sx={{ width: 0.5 }}
								variant="contained"
								onClick={() =>
									window.open(
										availableActions[0].link,
										"_blank"
									)
								}>
								{availableActions[0].label}
							</Button> : <></>}
					</div>
				</Box>
			</Modal>
		</>
	);
};

export default PopupMessage;