import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ListCard } from '../ListCard';

describe('ListCard', () => {
    it('should render children correctly', () => {
        const { getByText } = render(
            <ListCard>
                <Text>Test Content</Text>
            </ListCard>
        );

        expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render as View when no onPress is provided', () => {
        const { getByTestId } = render(
            <ListCard>
                <Text testID="content">Content</Text>
            </ListCard>
        );

        expect(getByTestId('content')).toBeTruthy();
    });

    it('should be pressable when onPress is provided', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <ListCard onPress={onPressMock}>
                <Text>Pressable Content</Text>
            </ListCard>
        );

        fireEvent.press(getByText('Pressable Content'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should apply custom styles', () => {
        const customStyle = { marginTop: 20 };
        const { getByText } = render(
            <ListCard style={customStyle}>
                <Text>Styled Content</Text>
            </ListCard>
        );

        expect(getByText('Styled Content')).toBeTruthy();
    });
});
