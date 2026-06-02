import React from 'react';

export const formatPhone = (userRegion, Phone, country) => {
	let format = ''
	if (userRegion.toLowerCase() === 'india') {
		format = Phone ? '(+##) (####) (######)' : '(+91) (####) (######)';
	} else {
		if (country == 1) {
			format = Phone ? '(+#) (###) (###) (####)' : '(+1) (###) (###) (####)';
		} else if (country == 2) {
			format = Phone ? '(+###) (###) (###) (###)' : '(+256) (###) (###) (###)';
		}
	}
	return format
}


export const placeholderPhone = (userRegion, country) => {
	let placeholder = ''
	if (userRegion.toLowerCase() === 'india') {
		placeholder = '(+91) (8888) (888888)';
	} else {
		if (country == 1) {
			placeholder = '(+1) (888) (888) (8888)';
		} else if (country == 2) {
			placeholder = '(+256) (888) (888) (888)';
		}
	}

	return placeholder
}
