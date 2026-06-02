const Banner = ({ subject, content }) => {
	return (
		<>
			<div style={{
				margin: '10px',
				boxShadow: '2px 2px 4px 0px rgba(0, 0, 0, 0.20)',
				border: '1px solid #FADE56',
				borderRadius: '10px',
				padding: '16px',
				backgroundColor: '#FADE56',
				color: '#0C1825'
			}}>
				{typeof content === 'string' && content.includes('<') && content.includes('>')
					? <div 
						dangerouslySetInnerHTML={{ __html: content }} 
						style={{ margin: 0, padding: 0 }} // Reset margin and padding for the container div
					/>
					: content}
			</div>
			<style jsx>{`
				div > p, div > h1, div > h2, div > h3, div > h4, div > h5, div > h6 {
					margin: 0; /* Reset margin for <p> and <h1> to <h6> elements */
					padding: 0; /* Reset padding for <p> and <h1> to <h6> elements */
				}
			`}</style>
		</>
	)
}

export default Banner;
