import React from 'react';
import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const AboutUs: React.FC = () => {
    return (
        <div style={{ padding: '10px' }}>
            <Title level={1}>About Us</Title>
                <Title level={2}>Our Mission</Title>
                <Paragraph>
                    At [Your Platform Name], our mission is to empower individuals by providing a safe and secure platform to report scammers and share their experiences. We believe that information is power, and together, we can create a community that actively combats fraud and protects others from falling victim to scams.
                </Paragraph>

                <Title level={2}>What We Do</Title>
                <Paragraph>
                    We provide a user-friendly interface where anyone can report scams they have encountered. Our platform allows users to share detailed information about scams, including the methods used, the identity of the scammers, and any other relevant details. This information helps us build a database of scams, which can be used to educate and inform the public.
                </Paragraph>

                <Title level={2}>Join Us in the Fight</Title>
                <Paragraph>
                    Your participation is crucial in the fight against scams. By reporting any suspicious activity or scams you encounter, you contribute to a safer online community. Our team reviews each report to ensure accuracy and validity, helping to maintain the integrity of our platform.
                </Paragraph>

                <Title level={2}>Contact Us</Title>
                <Paragraph>
                    If you have any questions, suggestions, or need assistance, feel free to contact us at <a href="mailto:support@gmail.com">support@yourplatform.com</a>. Together, we can make a difference!
                </Paragraph>
        </div>
    );
};

export default AboutUs;
