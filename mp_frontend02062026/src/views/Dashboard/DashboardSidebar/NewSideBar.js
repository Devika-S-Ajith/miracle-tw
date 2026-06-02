import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
//import Navigation from './Navigation'
//import { AuthContext } from '~/components/Contexts/AuthContext'
import Header from '~/components/Header/Header'
import useStyles from './Layout.js'
import ls from 'local-storage'
import { LOCAL_STORAGE_UI_STATE } from '~/lib/config'
import CircularProgress from '@mui/material/CircularProgress'
//import { useUser } from '~/lib/amplifyAuth'


function AuthedLayout({ children }) {
  const user = useUser()
  const role = user?.attributes ? user?.attributes['custom:roles'] : undefined

  const authState = useContext(AuthContext)
  const router = useRouter()
  

  // grabs the uiState from localStorage
  const classes = useStyles()
  const uiState = ls.get(LOCAL_STORAGE_UI_STATE) || {}
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    setIsOpen(uiState?.drawerIsOpen)
  }, [uiState?.drawerIsOpen])



  // this allows for the AuthLayout to keep the state of the drawer across pages.
  function toggleDrawer() {
    setIsOpen(!isOpen)
    ls.set(LOCAL_STORAGE_UI_STATE, { ...uiState, drawerIsOpen: !isOpen })
  }

  const childrenWithProps = React.Children.map(children, (child) => {
    // checking isValidElement is the safe way and avoids a typescript error too
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user: user })
    }
    return child
  })

  useEffect(() => {
    if (user === false) {
      router.push('/auth/login')
    }
  }, [user])

  return (
    <div className={`authed-wrapper ${classes.root}`}>
      {user ? (
        <>
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: isOpen,
              [classes.drawerClose]: !isOpen,
            })}
            classes={{
              paper: clsx(classes.drawer, {
                [classes.drawerOpen]: isOpen,
                [classes.drawerClose]: !isOpen,
              }),
            }}
          >
            <Navigation role={role} />
          </Drawer>
          <div
            className={clsx(classes.drawerToggle, {
              [classes.drawerToggleOpen]: isOpen,
              [classes.drawerToggleClosed]: !isOpen,
            })}
          >
            <IconButton onClick={toggleDrawer}>
              {!isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          {/* This dummy drawer pushes the rest of the content over when it is opening or closing */}
          <main
            className={`main-content ${clsx(classes.content, {
              [classes.contentOpen]: isOpen,
              [classes.contentClosed]: !isOpen,
            })}`}
          >
            <Header authState={authState} role={role} />
            {user && (
              <div style={{ paddingBottom: '40px' }}>{childrenWithProps}</div>
            )}
          </main>
        </>
      ) : (
        <div className={classes.center}>
          <CircularProgress />
        </div>
      )}
    </div>
  )
}

export default AuthedLayout