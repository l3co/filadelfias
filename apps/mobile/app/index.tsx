import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Index() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold text-primary-500">Filadélfias Mobile</Text>
            <Text className="text-gray-500">Setup Complete</Text>
        </View>
    );
}
