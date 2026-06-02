import { Avatar } from "@mui/material";

export const ProfileAvatar = ({ src, alt, initials }) => {
    return (
        <Avatar
            src={src}
            alt={alt}
            sx={{
                width: 40,
                height: 40,
                mb: 1,
                bgcolor: 'gray'
            }}
            slotProps={{
                img: {
                    sx: {
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                    }
                }
            }}
        >
            {initials}
        </Avatar>
    );
};