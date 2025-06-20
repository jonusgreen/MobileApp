"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export default function RentalManagementScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("properties")

  const renderProperties = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>My Rental Properties</Text>

      <View style={styles.propertyCard}>
        <Text style={styles.propertyName}>Sunset Apartment Complex</Text>
        <Text style={styles.propertyAddress}>123 Main Street, Downtown</Text>
        <View style={styles.propertyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Units</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>10</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.manageButton}>
          <Text style={styles.manageButtonText}>Manage Property</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add New Property</Text>
      </TouchableOpacity>
    </View>
  )

  const renderTenants = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Tenant Management</Text>

      <View style={styles.tenantCard}>
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>John Smith</Text>
          <Text style={styles.tenantUnit}>Unit 101 - Sunset Apartment</Text>
          <Text style={styles.tenantRent}>UGX 800,000/month</Text>
        </View>
        <View style={styles.tenantActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mail" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tenantCard}>
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>Sarah Johnson</Text>
          <Text style={styles.tenantUnit}>Unit 205 - Sunset Apartment</Text>
          <Text style={styles.tenantRent}>UGX 750,000/month</Text>
        </View>
        <View style={styles.tenantActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mail" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderPayments = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Payment Tracking</Text>

      <View style={styles.paymentSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>UGX 12,500,000</Text>
          <Text style={styles.summaryLabel}>Total Collected</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>UGX 1,550,000</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTenant}>John Smith - Unit 101</Text>
          <Text style={styles.paymentAmount}>UGX 800,000</Text>
          <Text style={styles.paymentDate}>Due: Dec 1, 2023</Text>
        </View>
        <View style={[styles.paymentStatus, styles.paidStatus]}>
          <Text style={styles.statusText}>Paid</Text>
        </View>
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTenant}>Sarah Johnson - Unit 205</Text>
          <Text style={styles.paymentAmount}>UGX 750,000</Text>
          <Text style={styles.paymentDate}>Due: Dec 1, 2023</Text>
        </View>
        <View style={[styles.paymentStatus, styles.pendingStatus]}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rental Management</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "properties" && styles.activeTab]}
          onPress={() => setActiveTab("properties")}
        >
          <Text style={[styles.tabText, activeTab === "properties" && styles.activeTabText]}>Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tenants" && styles.activeTab]}
          onPress={() => setActiveTab("tenants")}
        >
          <Text style={[styles.tabText, activeTab === "tenants" && styles.activeTabText]}>Tenants</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "payments" && styles.activeTab]}
          onPress={() => setActiveTab("payments")}
        >
          <Text style={[styles.tabText, activeTab === "payments" && styles.activeTabText]}>Payments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "properties" && renderProperties()}
        {activeTab === "tenants" && renderTenants()}
        {activeTab === "payments" && renderPayments()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    margin: 20,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  propertyCard: {
    backgroundColor: "#F9FAFB",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 15,
  },
  propertyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  manageButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  manageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  tenantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  tenantUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginVertical: 2,
  },
  tenantRent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  tenantActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  paymentSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTenant: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
    marginVertical: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  paymentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidStatus: {
    backgroundColor: "#D1FAE5",
  },
  pendingStatus: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
})
