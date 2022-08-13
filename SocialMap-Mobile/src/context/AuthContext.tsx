import React, { ReactElement, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"
import jwtDecode from "jwt-decode";

import { Action } from "../models/Actions"
import server from "../api/server";
import Utils from "../Utils"
import { Profile } from '../models/Profile'
import Cover from "../assets/backgroundPerfil";


interface TokenUser {
    name: string
    user: string
    profile_id: string
    midia: string | null
}

interface LoginIProp {
    user: string
    password: string
}

interface RegisterIProp extends LoginIProp {
    name: string
    passwordConfirm: string
}

interface IAuthContext {
    token: string | null
    user: string | null
    profile_id: string | null
    name?: string
    midia?: string | null
    profile: Profile,
    errorMessage?: string
    successfulMessage?: string
    isLoading: boolean
    background: any,
    login?: () => void
    register?: () => void
    loginStorage?: () => void
    logout?: () => void
    getProfile?: () => void
}

const profileClean = {
    _id: '',
    name: '',
    followers: [''],
    following: [''],
    posts: [''],
    user: ''
}

const defaultValue = {
    token: null,
    user: null,
    profile_id: null,
    isLoading: true,
    profile: profileClean,
    background: Cover[Utils.randomNumber(0, Cover.length)]
}


const Context = React.createContext<IAuthContext>(defaultValue)

const Provider = ({ children }: { children: ReactElement }) => {

    const reducer = (state: any, action: Action) => {
        switch (action.type) {
            case "login":
                return { ...state, ...action.payload, isLoading: false }
            case "logout":
                return { ...state, ...action.payload, isLoading: false }
            case "setProfile":
                return { ...state, profile: action.payload }
            case "error":
                return { ...state, errorMessage: action.payload }
            case "successfulMessage":
                return { ...state, successfulMessage: action.payload }
            default:
                return state
        }
    }
    const [state, dispatch] = useReducer(reducer, defaultValue)

    const login = async ({ user, password }: LoginIProp) => {
        try {
            const response = await server.noAuth.post("/unsecurity/login", { user, password })
            const { accessToken } = response.data
            const decoded = jwtDecode(accessToken) as TokenUser
            AsyncStorage.setItem("accessToken", accessToken)
            AsyncStorage.setItem("user", decoded.user)
            AsyncStorage.setItem("profile_id", decoded.profile_id)
            AsyncStorage.setItem("name", decoded.name)
            decoded.midia ? AsyncStorage.setItem("midia", decoded.midia) : ''
            dispatch({ type: "login", payload: { token: accessToken, profile: decoded.profile_id, user: decoded.user } })
        } catch (err: any) {
            err.response.status === 401 ?
                Utils.setMessagensContext(dispatch, "error", "Usuario ou Senha incorretos!") :
                Utils.setMessagensContext(dispatch, "error", "Houve algum erro inesperado!")
        }
    }

    const loginStorage = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken")
            const profile_id = await AsyncStorage.getItem("profile_id")
            const user = await AsyncStorage.getItem("user")
            const name = await AsyncStorage.getItem("name")
            const midia = await AsyncStorage.getItem("midia")
            dispatch({
                type: "login", payload: { token, profile_id, user, name, midia }
            })
        } catch (err) {
            Utils.setMessagensContext(dispatch, "error", "Por favor faço o login novamente!", { isLoading: true })
        }
    }

    const register = async ({ name, user, password, passwordConfirm }: RegisterIProp) => {
        if (password === passwordConfirm) {
            try {
                await server.noAuth.post("/unsecurity/register", {
                    name,
                    user,
                    password,
                })
                Utils.setMessagensContext(dispatch, "successfulMessage", "Usuario criado com sucesso tentando fazer o login")
                login({ user, password })

            } catch (err) {
                Utils.setMessagensContext(dispatch, "error", "Erro na criação do usuario!")
            }
        } else {
            Utils.setMessagensContext(dispatch, 'error', 'Senhas não correspondem!')
        }
    }

    const logout = async () => {
        await AsyncStorage.clear()
        dispatch({ type: "logout", payload: defaultValue })
    }

    const getProfile = async () => {
        const token = await AsyncStorage.getItem("accessToken")
        const profile_id = await AsyncStorage.getItem("profile_id")
        try {
            const response = await server.auth(token).get(`/profiles/${profile_id}`)
            dispatch({ type: "setProfile", payload: response.data })
        } catch (error) {
            Utils.setMessagensContext(dispatch, "error", "Erro na busca do perfil!")
        }
    }

    return (
        <Context.Provider value={{ ...state, login, register, loginStorage, logout, getProfile }}>
            {children}
        </Context.Provider>
    )
}

export { Provider, Context }