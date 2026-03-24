import React from 'react';
import { Skeleton, Box } from '@mui/material';

const BarChartSkeleton = ({ 
    bars = 6, 
    height = 300, 
    showLabels = true, 
    showTitle = true 
}) => {
    return (
        <Box sx={{ p: 3, width: '100%' }}>
            
            {/* Legend skeleton - moved to top */}
            <Box sx={{ 
                mb: 3, 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 3 
            }}>
                {[...Array(4)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton 
                            variant="rectangular" 
                            width={16} 
                            height={16}
                            sx={{ animationDelay: `${i * 0.2}s` }}
                        />
                        <Skeleton 
                            variant="text" 
                            width={64} 
                            height={16}
                            sx={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                        />
                    </Box>
                ))}
            </Box>
            
            {/* Chart container */}
            <Box sx={{ position: 'relative', height: `${height}px` }}>
                {/* Bar chart area - no Y-axis labels */}
                <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-between',
                    gap: 1
                }}>
                    {[...Array(bars)].map((_, i) => {
                        // Random heights for more realistic skeleton
                        const randomHeight = Math.floor(Math.random() * 80) + 20;
                        
                        return (
                            <Box key={i} sx={{ 
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', // Ensure bars start from x-axis
                                height: '100%'
                            }}>
                                {/* Bar skeleton */}
                                <Skeleton 
                                    variant="rectangular"
                                    width={32}
                                    height={randomHeight * (height - (showLabels ? 32 : 0)) / 100} // scale height
                                    sx={{ 
                                        mb: showLabels ? 2 : 0, 
                                        animationDelay: `${i * 0.12}s` 
                                    }}
                                />
                                {/* X-axis label */}
                                {showLabels && (
                                    <Box sx={{ mt: 1 }}>
                                        <Skeleton 
                                            variant="text" 
                                            width={48} 
                                            height={16}
                                            sx={{ animationDelay: `${i * 0.1}s` }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
                
                {/* X-axis line only */}
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: showLabels ? 32 : 0, 
                    left: 0, 
                    right: 0, 
                    height: '1px', 
                    bgcolor: 'divider' 
                }} />
            </Box>
        </Box>
    );
};

export default BarChartSkeleton;