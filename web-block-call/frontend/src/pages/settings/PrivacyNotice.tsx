import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

const PrivacyNotice: React.FC = () => {
    return (
        <div style={{ padding: '10px' }}>
            <Title level={1}>Privacy Notice for Reporting Scammers</Title>
            <Paragraph><strong>Effective Date:</strong> 29/September/2024</Paragraph>

            <Paragraph>
                At Block Scammer, we value your privacy and are committed to protecting your personal information. This privacy notice explains how we collect, use, and protect the information you provide when you report a scammer through our platform.
            </Paragraph>

            <Divider />

            <Title level={2}>1. Information We Collect</Title>
            <Paragraph>
                When you report a scammer, we may collect the following types of personal information:
            </Paragraph>
            <ul>
                <li><strong>Your Name:</strong> To identify you as the reporter.</li>
                <li><strong>Email Address:</strong> To communicate with you regarding your report.</li>
                <li><strong>Details of the Incident:</strong> Information about the scammer, including descriptions, evidence, and any related communications.</li>
            </ul>

            <Divider />

            <Title level={2}>2. Purpose of Collection</Title>
            <Paragraph>
                We collect this information for the following purposes:
            </Paragraph>
            <ul>
                <li>To investigate and take appropriate action regarding the reported scammer.</li>
                <li>To improve our services and prevent future scams.</li>
                <li>To communicate with you about your report and any necessary follow-up.</li>
            </ul>

            <Divider />

            <Title level={2}>3. Data Protection Measures</Title>
            <Paragraph>
                We implement a variety of security measures to protect your personal information, including:
            </Paragraph>
            <ul>
                <li><strong>Encryption:</strong> Your data is transmitted using secure encryption protocols.</li>
                <li><strong>Access Control:</strong> Only authorized personnel have access to your personal information.</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits to ensure our systems remain secure.</li>
            </ul>

            <Divider />

            <Title level={2}>4. Data Retention</Title>
            <Paragraph>
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this notice or as required by law.
            </Paragraph>

            <Divider />

            <Title level={2}>5. Your Rights</Title>
            <Paragraph>
                You have the right to:
            </Paragraph>
            <ul>
                <li>Access your personal information.</li>
                <li>Request corrections to your personal information.</li>
                <li>Withdraw your consent at any time, where we rely on your consent to process your personal information.</li>
            </ul>

            <Divider />

            <Title level={2}>6. Changes to This Notice</Title>
            <Paragraph>
                We may update this privacy notice from time to time. We will notify you of any changes by posting the new notice on our website. We encourage you to review this notice periodically for any updates.
            </Paragraph>

            <Divider />

            <Title level={2}>7. Contact Us</Title>
            <Paragraph>
                If you have any questions or concerns about this privacy notice or our data practices, please contact us at:
            </Paragraph>
            <Paragraph>
                <strong>Email:</strong> report_scammer@gmail.com<br />
                {/* <strong>Phone:</strong> [Your Contact Number] */}
            </Paragraph>
        </div>
    );
};

export default PrivacyNotice;
