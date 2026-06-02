import Amplify, { Auth } from 'aws-amplify';
import { getAmplifyConfig } from '../config';

Amplify.configure(getAmplifyConfig());


export const signUp = async (signUpData) => {
	let username = signUpData.username;
	let password = signUpData.password;
	let email = signUpData.email;
	let phone_number = signUpData.phone_number;
	let given_name = signUpData.firstName;
	let family_name = signUpData.lastName;
	try {
		const { user } = await Auth.signUp({
			username,
			password,
			attributes: {
				email,          // optional
				phone_number,
				given_name,
				family_name,
				//given_name,
				//family_name   // optional - E.164 number convention
				// other custom attributes 
				//'custom:favorite_flavor': 'Cookie Dough'  // custom attribute, not standard
			}
		});
		return { user };
	} catch (error) {
		let errorObject = {
			message: "Error creating user",
			error: error
		}
		console.log('error signing up:', error);
		return errorObject;
	}
}


export const confirmSignUp = async (signinData) => {
	let username = signinData.username;
	let code = signinData.code;
	try {
		const res = await Auth.confirmSignUp(username, code);
		return res;
	} catch (error) {
		let errorObject = {
			message: "Error confirming signUp",
			error: error
		}
		console.log('error signing up:', error);
		return errorObject;
	}
}

export const signIn = async (signinData) => {
	let username = signinData.username;
	let password = signinData.password;
	try {
		const res = await Auth.signIn(username, password);
		return res;
	} catch (error) {
		let errorObject = {
			message: "Error in signIn",
			error: error
		}
		return errorObject;
	}
}


export const completePassword = async (user, newPassword) => {
	try {
		const res = await Auth.completeNewPassword(user, newPassword);
		return res;
	} catch (error) {
		let errorObject = {
			message: "Error in completeNewPassword",
			error: error
		}
		console.log('error in completeNewPassword:', error);
		return errorObject;
	}
}


export const fetchCurrentUser = async () => {
	try {
		const res = await Auth.currentAuthenticatedUser()
		return res;
	}
	catch (error) {
		let errorObject = {
			message: "Error in fetching user",
			error: error
		}
		console.log('error fetching user :', error);
		return errorObject;
	}

}


export const resendConfirmationCode = async (username) => {
	try {
		const res = await Auth.resendSignUp(username)
		return res;
	} catch (err) {
		console.log('error resending code: ', err);
	}
}

export const forgotPassword = async (username) => {

	try {
		const resp = await Auth.forgotPassword(username);
		return resp;
	} catch (err) {
		console.log('error resending code: ', err);
		return err;

	}
}

export const forgotPasswordSubmit = async (data) => {
	const username = data.username
	const code = data.code
	const new_password = data.new_password
	try {
		const resp = await Auth.forgotPasswordSubmit(username, code, new_password);
		return resp;
	} catch (err) {
		return err;
	}
}

export const signOut = async () => {
	try {
		const resp = await Auth.signOut();
		return resp;
		//await Auth.signOut({global : true});
	} catch (err) {
		return console.log('error during signing out: ', err);
	}
}

export const changePassword = async (data) => {
	const currentPassword = data.old_password
	const proposedPassword = data.new_password
	try {
		await Auth.currentAuthenticatedUser().then(user => {
			const resp = Auth.changePassword(user, currentPassword, proposedPassword);
			return resp;
		})
	} catch (err) {
		return err;
	}
}