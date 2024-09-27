// YourMainComponent.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery, gql } from '@apollo/client';

// Define your GraphQL query
const GET_DATA = gql`
    query GetData {
        data {
            id
            name
        }
    }
`;

const YourMainComponent: React.FC = () => {
    const { loading, error, data } = useQuery(GET_DATA);

    if (loading) return <ActivityIndicator />;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <View>
            {data.data.map((item: { id: string; name: string }) => (
                <Text key={item.id}>{item.name}</Text>
            ))}
        </View>
    );
};

export default YourMainComponent;
