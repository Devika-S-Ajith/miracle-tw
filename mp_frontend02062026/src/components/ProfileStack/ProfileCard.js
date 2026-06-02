import { Box } from "@mui/system";
import { ProfileAvatar } from "./ProfileAvatar";
import { Typography } from "@mui/material";

export const ProfileCard = ({ imageUrl, name, initials }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 'fit-content'
            }}
        >
            <ProfileAvatar 
                src={imageUrl} 
                alt={name} 
                initials={initials}
            />
            <Typography
                variant="body2"
                align="center"
                sx={{
                    maxWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                }}
            >
                {name}
            </Typography>
        </Box>
    );
};