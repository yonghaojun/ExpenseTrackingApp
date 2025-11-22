import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: '#4B9089',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          position: 'absolute',
          height: 80, // Ensure enough height for proper centering
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
          width: '140%', // number of tabs x 20% (so only the first 5 main tabs show up on the screen)
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10, // lower icons closer to the bottom edge
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addExpense"
        options={{
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              {...(props as any)}
              style={styles.fabContainer}
            >
              <View style={styles.fabCircle}>
                <MaterialIcons name="add" size={30} color="#fff" />
              </View>
            </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="viewSpending"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={30} color={color} />
            
          ),
        }}
      />

      <Tabs.Screen
        name="group/[id]"
        options={{
          tabBarButton: () => null
        }}
      />

      <Tabs.Screen
        name="group/[id]/add-member"
        options={{
          tabBarButton: () => null
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 74,
    height: 74,
  },
  fabCircle: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#4B9089',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});
