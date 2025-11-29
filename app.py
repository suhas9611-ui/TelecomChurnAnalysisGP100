import streamlit as st
import pandas as pd
import pickle
import plotly.express as px

st.set_page_config(page_title="Churn Dashboard", layout="wide")

with open("churn_model.pkl", "rb") as f:
    data = pickle.load(f)

model = data["model"]
encoders = data["encoders"]
model_cols = data["columns"]

df = pd.read_csv("customers.csv")

churn_col = "Churn" 
df[churn_col] = df[churn_col].map({"Yes": 1, "No": 0})

# Compute churn rate
churn_rate = df[churn_col].mean() * 100

# Display Churn insights from CSV
st.title("Customer Churn Dashboard")

st.markdown("---")

col1, col2, col3 = st.columns(3)

with col1:
    st.metric("Total Customers", df.shape[0])

with col2:
    st.metric("Churned Customers", df[df[churn_col] == 1].shape[0])

with col3:
    st.metric("Churn Rate (%)", f"{churn_rate:.2f}%")

st.markdown("---")

st.subheader("Churn Insights")

colA, colB = st.columns(2)

with colA:
    if "gender" in df.columns:
        fig = px.histogram(df, x="gender", color="Churn",
                           barmode="group", title="Churn by Gender")
        st.plotly_chart(fig, use_container_width=True)

with colB:
    if "contract_type" in df.columns:
        fig = px.histogram(df, x="contract_type", color="Churn",
                           barmode="group", title="Churn by Contract Type")
        st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# Live Churn Prediction
st.subheader("Live Churn Prediction Tool")

input_data = {}

with st.form("predict_form"):
    st.write("Enter customer information:")

    for col in model_cols:
        if col in encoders:
            options = list(encoders[col].classes_)
            val = st.selectbox(col, options)
            input_data[col] = encoders[col].transform([val])[0]
        else:             
            val = st.number_input(col, value=0.0)
            input_data[col] = val

    submit = st.form_submit_button("Predict")

if submit:
    df_input = pd.DataFrame([input_data])
    pred = model.predict(df_input)[0]
    prob = model.predict_proba(df_input)[0][1]

    st.subheader("Prediction Result")

    st.write(f"**Churn Probability:** `{prob:.2f}`")

    if pred == 1:
        st.error("!!! This customer is *likely to churn*.")
    else:
        st.success("This customer is *unlikely to churn*.")
