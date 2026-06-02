import React from 'react';
import { Card, CardContent, Container, Typography } from '@mui/material';
import useStyle from "./Disclosure.style"

const DisclosurePage = () => {
    const classes = useStyle()
    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 1,
        }}>
            <Card sx={{ my: 4, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p:2 }}>
                    <Typography variant="h3" textAlign="center" sx={{my:2}}>Electronic Record and Signature Disclosure</Typography>
                    <Typography variant="body1">
                        This Electronic Record and Signature Disclosure ("Disclosure") applies to your use of the
                        ThriveWell product ("Product") offered by Miracle Foundation, Inc. (“Company”, “us, or “we”).
                        By using the Product, you agree to the terms and conditions outlined in this Disclosure.
                    </Typography>
                    <ol className={classes.romanList}>
                        <li>
                            <Typography variant="body1">
                                <strong>Consent to Use Electronic Records and Signatures</strong>
                            </Typography>
                            <ol>
                                <li>
                                    You acknowledge that you understand and agree that all agreements, notices, disclosures, and
                                    other communications that we provide to you or that you provide to us, including but not limited
                                    to enrollment forms, authorization forms, and consent forms, may be provided to you electronically.
                                    You further acknowledge that your electronic signature on any of these documents is the same as your
                                    handwritten signature for all legal purposes and is legally binding. You further agree that your use
                                    of a keypad, mouse, or another device to select an item, button, icon, or similar act/action, or to
                                    otherwise provide your instructions or forms in connection with the Product constitutes your signature.
                                </li>
                                <li>
                                    You also agree that no certification authority or other third-party verification is necessary to validate
                                    your electronic signature and that the lack of such certification or third-party verification will not in
                                    any way affect the enforceability of your electronic signature or any resulting contract between you and
                                    the Company.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Hardware and Software Requirements</strong>
                            </Typography>
                            <ol start="3">
                                <li>
                                    To access and retain electronic records and signatures, you must have access to a computer or mobile device
                                    with internet access, an up-to-date web browser, and an email account. You may need to download software or
                                    plug-ins to access certain features of the Product. You are responsible for all costs associated with accessing
                                    the internet and using the necessary hardware and software.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Right to Withdraw Consent</strong>
                            </Typography>
                            <ol start="4">
                                <li>
                                    You have the right to withdraw your consent to use electronic records and signatures at any time
                                    by providing written notice to the Company at <span>
                                        <a href="mailto: support@thrivewellapp.com" style={{ textDecoration: 'underline' }}>
                                            support@thrivewellapp.com</a></span> with your full name, email address, mailing address,
                                    and telephone number. If you choose to withdraw your consent, we may terminate your access to the Product.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Paper Copies</strong>
                            </Typography>
                            <ol start="5">
                                <li>
                                    If you wish to receive a paper copy of any electronic records or signatures, you may request one by
                                    contacting our customer service department at 512-329-8635 or <span>
                                        <a href="mailto: support@thrivewellapp.com" style={{ textDecoration: 'underline' }}>
                                            support@thrivewellapp.com</a></span>. You may also write to us at 1506 W 6th St, Austin, TX 78703.
                                    We may charge you a reasonable fee for providing paper copies.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Updating Your Contact Information</strong>
                            </Typography>
                            <ol start="6">
                                <li>
                                    You are responsible for ensuring that your contact information, including your email address, is
                                    accurate and up-to-date. If your contact information changes, you must notify us immediately.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Security Measures</strong>
                            </Typography>
                            <ol start="7">
                                <li>
                                    We take reasonable steps designed to ensure the security and confidentiality of your
                                    electronic records and signatures. However, you acknowledge that no electronic
                                    transmission of information can be completely secure and that we cannot guarantee
                                    the security of your information.
                                </li>
                            </ol>
                        </li>
                        <li>
                            <Typography variant="body1">
                                <strong>Acknowledgment of Understanding</strong>
                            </Typography>
                            <ol start="8">
                                <li>
                                    By using the Product, you acknowledge that you have read and understood this Electronic
                                    Record and Signature Disclosure and that you consent to the use of electronic records and
                                    signatures as described in this Disclosure.
                                </li>
                            </ol>
                        </li>
                    </ol>
                </CardContent>
            </Card>
        </Container>
    );
};

export default DisclosurePage;
