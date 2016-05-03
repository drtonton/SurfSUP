package com.theironyard.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theironyard.entities.Friend;
import com.theironyard.entities.Join;
import com.theironyard.entities.Sesh;
import com.theironyard.entities.User;
import com.theironyard.services.FriendRepository;
import com.theironyard.services.JoinRepository;
import com.theironyard.services.SeshRepository;
import com.theironyard.services.UserRepository;
import com.theironyard.utilities.PasswordStorage;
import org.h2.tools.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;


/**
 * Created by keatonfoster on 4/6/16.
 */
@RestController
public class SurfSupController {

    static final String IOP_URL = "http://magicseaweed.com/api/05b02278d73272e0e716626de5b875e4/forecast/?spot_id=760";
    static final String PAWLEY_URL = "http://magicseaweed.com/api/05b02278d73272e0e716626de5b875e4/forecast/?spot_id=989";
    static final String WASHOUT_URL = "http://magicseaweed.com/api/05b02278d73272e0e716626de5b875e4/forecast/?spot_id=406";
    static final String IOP_TIDE_URL = "http://www.worldtides.info/api?extremes&lat=33.746&lon=-84.127&key=cb380c07-986b-452e-ab83-c8ad144407bf";
    static final String PAWLEYS_TIDE_URL = "http://www.worldtides.info/api?extremes&lat=34.805&lon=-82.211&key=cb380c07-986b-452e-ab83-c8ad144407bf";
    static final String WASHOUT_TIDE_URL = "http://www.worldtides.info/api?extremes&lat=32.655&lon=-79.940&key=cb380c07-986b-452e-ab83-c8ad144407bf";

    /**
     * This converter will allow for parsing "text/json" into a HashMap. Required to utilize the World Tides API.
     * Credit to Zach Oakes for helping with this solution.
     */
    AbstractHttpMessageConverter converter = new AbstractHttpMessageConverter(MediaType.parseMediaType("text/json")) {
        @Override
        protected Object readInternal(Class clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
            ObjectMapper om = new ObjectMapper();
            InputStream is = inputMessage.getBody();
            Scanner s = new Scanner(is).useDelimiter("\\A");
            String msg = s.next();
            return om.readValue(msg, clazz);
        }

        @Override
        protected void writeInternal(Object o, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException {

        }

        @Override
        protected boolean supports(Class clazz) {
            return true;
        }
    };

    @Autowired
    UserRepository users;

    @Autowired
    SeshRepository seshs;

    @Autowired
    JoinRepository joins;

    @Autowired
    FriendRepository friends;

    Server dbui;

    @PostConstruct
    public void construct() throws SQLException, SQLException {
        dbui = Server.createWebServer().start();
    }

    @PreDestroy
    public void destroy() {
        dbui.stop();
    }

    // CREATES A USER
    @RequestMapping(path = "/user", method = RequestMethod.POST)
    public User createUser (@RequestBody User user, HttpSession session) throws Exception {
        if (users.findByUsername(user.getUsername()) == null) {
            user.setPassword(PasswordStorage.createHash(user.getPassword()));
            session.setAttribute("username", user.getUsername());
            users.save(user);
            return user;
        }
        else {
            throw new Exception("Username already taken");
        }

    }

    // LOGIN
    @RequestMapping(path = "/login", method = RequestMethod.POST)
    public User login (@RequestBody User user, HttpSession session) throws Exception {
        if (session.getAttribute("username") == null) {
            User existing = users.findByUsername(user.getUsername());
            if (existing != null) {

                //SUCCESS SCENARIO
                if (PasswordStorage.verifyPassword(user.getPassword(), existing.getPassword())) {
                    session.setAttribute("username", user.getUsername());
                    return user;

                    //PASSWORD FAIL SCENARIO
                } else if (!PasswordStorage.verifyPassword(user.getPassword(), existing.getPassword())) {
                    throw new Exception("Password do not match");
                }
            } else {
                throw new Exception("Username does not exist in database");
            }
        }
        return null;
    }

    // CREATE A SESH
    @RequestMapping(path = "/sesh", method = RequestMethod.POST)
    public Sesh addSesh (@RequestBody Sesh sesh, HttpSession session) {
        User user = getUserFromSession(session);
        sesh.setUser(user);
        seshs.save(sesh);

        //joins user and sesh in Joins table
        Join join = new Join(user, sesh);
        joins.save(join);
        return sesh;
    }

    // UPLOAD PROFILE PICTURE (IF ALREADY LOGGED IN)
    @RequestMapping(path = "/upload", method = RequestMethod.POST)
    public void addProfile (@RequestBody MultipartFile photo, HttpSession session) throws IOException {
        User existing = getUserFromSession(session);

        // store photo file name in db
        File dir = new File("public/profile");
        dir.mkdirs();
        File photoFile = File.createTempFile("image", photo.getOriginalFilename(), dir);
        FileOutputStream fos = new FileOutputStream(photoFile);
        fos.write(photo.getBytes());
        existing.setPhotoFileName(photoFile.getName());

        users.save(existing);
    }

    /**
     * This will create a Friend object (User requester, User responder). Does not set the parameter
     * isAccepted (this boolean is only changed when the friend request is accepted). The @RequestBody
     * String username refers to the username of the approver.
     * @param session : logged in user
     * @param username : Username of the user being friend requested
     * @throws Exception
     */
    //SEND FRIEND REQUEST
    @RequestMapping(path = "/friend", method = RequestMethod.POST)
    public void createFriend (HttpSession session, @RequestBody String username) throws Exception {
        User requester = getUserFromSession(session);
        User approver = users.findByUsername(username);
        Friend friend = new Friend (requester, approver);
        if (friends.findFirstByRequesterAndApprover(requester, approver) == null){
            friends.save(friend);
        } else {
            throw new Exception("Friendship already requested");
        }
    }

    /**
     * This will create the reciprocal of the Friend object created by method: createFriend.
     * This created object will have its boolean parameter, isAccepted, set to TRUE.
     * @param session : logged in user
     * @param username : Username of user who requested friendship
     * @throws Exception
     */
    //ACCEPTS FRIEND REQUEST
    @RequestMapping(path = "/friend/friend", method = RequestMethod.POST)
    public void acceptFriend (HttpSession session, @RequestBody String username) throws Exception {
        User requester = getUserFromSession(session);
        User approver = users.findByUsername(username);
        Friend friend = new Friend (requester, approver);
        if (friends.findFirstByRequesterAndApprover(requester, approver) == null){
            friend.setIsApproved(true);
            friends.save(friend);
        } else {
            throw new Exception("Friendship already requested");
        }
    }

    //INVITE FRIENDS TO JOIN A SESH (ID = USER BEING INVITED'S ID)
    @RequestMapping(path = "/join/{userId}/{seshId}", method = RequestMethod.POST)
    public void inviteFriendToJoin (@PathVariable("userId") int userId, @PathVariable("seshId") int seshId) {
        User invitedUser = users.findOne(userId);
        Sesh seshToJoin = seshs.findOne(seshId);
        Join join = new Join(invitedUser, seshToJoin);
        joins.save(join);
    }

    //JOIN A SESH (ID = SESH ID)
    @RequestMapping(path = "/join/{id}", method = RequestMethod.POST)
    public void joinSesh (@PathVariable("id") int seshId, HttpSession session) throws Exception {
        User user = getUserFromSession(session);
        Sesh sesh = seshs.findOne(seshId);
        Join join = new Join (user, sesh);
        if (joins.findFirstByUserAndSesh(user, sesh) == null) {
            joins.save(join);
        }
        else {
            throw new Exception ("User already joined sesh");
        }
    }

    //WEATHER AT IOP
    @RequestMapping(path = "/weatherIOP", method = RequestMethod.GET)
    public List weatherIop () {
        RestTemplate query = new RestTemplate();
        List result = query.getForObject(IOP_URL, List.class);
        if (result != null) {
            return result;
        }
        return null;
    }

    //WEATHER AT SHEM CREEK
    @RequestMapping(path = "/weatherPawley", method = RequestMethod.GET)
    public List weatherPawley () {
        RestTemplate query = new RestTemplate();
        List result = query.getForObject(PAWLEY_URL, List.class);
        if (result != null) {
            return result;
        }
        return null;
    }

    //WEATHER AT WASHOUT
    @RequestMapping(path = "/weatherWashout", method = RequestMethod.GET)
    public List weatherWashout () {
        RestTemplate query = new RestTemplate();
        List result = query.getForObject(WASHOUT_URL, List.class);
        if (result != null) {
            return result;
        }
        return null;
    }

    //TIDAL EXTREMES AT IOP
    @RequestMapping(path = "/tidesIOP", method = RequestMethod.GET)
    public HashMap tidesIop () {
        RestTemplate query = new RestTemplate(Arrays.asList(converter));
        return query.getForObject(IOP_TIDE_URL, HashMap.class);
    }

    //TIDAL EXTREMES AT PAWLEY'S PIER
    @RequestMapping(path = "/tidesPawleys", method = RequestMethod.GET)
    public HashMap tidesPawleys () {
        RestTemplate query = new RestTemplate(Arrays.asList(converter));
        return query.getForObject(PAWLEYS_TIDE_URL, HashMap.class);

    }

    //TIDAL EXTREMES AT THE WASHOUT
    @RequestMapping(path = "/tidesWashout", method = RequestMethod.GET)
    public HashMap tidesWashout () {
        RestTemplate query = new RestTemplate(Arrays.asList(converter));
        return query.getForObject(WASHOUT_TIDE_URL, HashMap.class);
    }

    // CURRENT USER USERNAME
    @RequestMapping(path = "/currentUsername", method = RequestMethod.GET)
    public String loggedInUsername (HttpSession session) {
        return (String) session.getAttribute("username");
    }

    //RETURNS CURRENT USER PROFILE
    @RequestMapping(path = "/currentUser", method = RequestMethod.GET)
    public User loggedInUser (HttpSession session) {
        return getUserFromSession(session);
    }

    // LOGOUT
    @RequestMapping(path = "/logout", method = RequestMethod.GET)
    public void logout (HttpSession session) {
        session.invalidate();
    }

    // DISPLAY ALL SESHS (PUBLIC SESH LIST. THIS WOULD BE HUGE,
    // AND I DONT KNOW WHY YOUD WANT TO USE IT, BUT HERE IT IS IN CASE)
    @RequestMapping(path = "/sesh", method = RequestMethod.GET)
    public List<Sesh> displayAllSesh () {
        return (List<Sesh>) seshs.findAll();
    }

    //DISPLAY SESHS BY USER
    @RequestMapping(path = "/user/{id}/sesh", method = RequestMethod.GET)
    public List<Sesh> displaySeshByUser (@PathVariable("id") int id) {
        User user = users.findOne(id);
        return seshs.findAllByUser(user);
    }

    //DISPLAY CURRENT USERS SESHS
    @RequestMapping(path = "currentUser/{id}", method = RequestMethod.GET)
    public List<Sesh> currentUsersSeshs (HttpSession session) {
        User user = getUserFromSession(session);
        return seshs.findAllByUser(user);
    }

    //DISPLAY SESHS BY THE CURRENT USER AND HIS/HER FRIENDS
    @RequestMapping(path = "/user/friend/sesh", method = RequestMethod.GET)
    public List<Sesh> displayUserAndFriendsSeshs (HttpSession session) {
        User loggedIn = getUserFromSession(session);
        List <Sesh> usersSeshs = seshs.findAllByUser(loggedIn);
        List <Sesh> friendsSeshs = new ArrayList<>();
        // friendsSeshs is to be the return

        List<Friend> allList = friends.findAllByRequester(loggedIn);
        allList.addAll(friends.findAllByApprover(loggedIn));
        //creates a list of friend objects that contain the current user

        List<User> friendsList = returnList(loggedIn, allList);

        for (User user : friendsList) {
            friendsSeshs.addAll(seshs.findAllByUser(user));
        }
        friendsSeshs.addAll(usersSeshs);
        return friendsSeshs;
    }

    //DISPLAY ALL USERS
    @RequestMapping(path = "/user", method = RequestMethod.GET)
    public List<User> displayUser (HttpSession session) {
        List<User> userList = (List<User>) users.findAll();
        User user = getUserFromSession(session);
        userList.remove(user);
        return userList;
    }

    //DISPLAY FRIENDS LIST
    @RequestMapping(path = "/friend", method = RequestMethod.GET)
    public List<User> friendList (HttpSession session) {
        User user = getUserFromSession(session);
        List<Friend> allList = friends.findAllByRequester(user);
        allList.addAll(friends.findAllByApprover(user));
        //creates a list of friend objects that contain the current user

        return returnList(user, allList);
    }

    //NUMBER OF FRIEND REQUESTS
    @RequestMapping(path = "/requestAmt", method = RequestMethod.GET)
    public int friendRequestsAmt (HttpSession session) {
        User user = getUserFromSession(session);
        List<Friend> allList = (List<Friend>) friends.findAll();
        List<User> requestList = new ArrayList<>();
        if (allList != null) {
            for (Friend f : allList) {

                // populating requestList with users who "friended" current user
                if (f.getApprover().getId() == user.getId()) {
                    requestList.add(f.getRequester());

                    // removing users from requestList who have been "friended back" by current user
                    for (Friend f2 : allList) {
                        if (f2.getRequester().getId() == user.getId()) {
                            requestList.remove(f2.getApprover());
                        }
                    }
                }
            }
        }
        // requestList.size == number of pending requests
        return requestList.size();
    }

    //LIST OF ACTUAL FRIEND REQUESTS
    @RequestMapping(path = "/requests", method = RequestMethod.GET)
    public List<User> friendRequests (HttpSession session) throws Exception {
        User user = getUserFromSession(session);
        List<Friend> allList = (List<Friend>) friends.findAll();
        List<User> requestList = new ArrayList<>();
        if (allList != null) {
            for (Friend f : allList) {

                // populating requestList with users who "friended" current user
                if (f.getApprover().getId() == user.getId()) {
                    requestList.add(f.getRequester());

                    // removing users from requestList who have been "friended back" by current user
                    for (Friend ff : allList) {
                        if (ff.getRequester().getId() == user.getId()) {
                            requestList.remove(ff.getApprover());
                        }
                    }
                }
            }
        }
        if (requestList.size() == 0) {
            throw new Exception("No friend requests have been made for this user");
        }
        else {
            return requestList;
        }
    }

    //DISPLAY PROFILE
    @RequestMapping(path = "/user/{id}", method = RequestMethod.GET)
    public User showProfile (@PathVariable("id") int id) {
        return users.findOne(id);
    }

    //DISPLAY USERS WHO JOINED A SESH (ID = SESH ID)
    @RequestMapping(path = "/sesh/{id}", method = RequestMethod.GET)
    public List<User> joinedUsers (@PathVariable("id") int id) {
        Sesh sesh = seshs.findOne(id);
        List<User> joined = new ArrayList<>();
        List<Join> all = (List<Join>) joins.findAll();
        if (all != null) {
            for (Join j : all) {
                if (j.getSesh().getId() == id) {
                    joined.add(j.getUser());
                }
            }
        }
        joined.remove(sesh.getUser()); // removes the sesh creator from the list
        return joined;
    }

    //RETURNS A SINGLE SESH OBJECT (ID = SESH ID)
    @RequestMapping(path = "/sesh/{id}/coords", method = RequestMethod.GET)
    public Sesh oneSesh (@PathVariable("id") int id) {
        return seshs.findOne(id);
    }

    //EDIT EXISTING SESH
    @RequestMapping(path = "/sesh", method = RequestMethod.PUT)
    public void editSesh (@RequestBody Sesh sesh, HttpSession session) {
        User u = getUserFromSession(session);
        if (u.getId() == sesh.getUser().getId()) {
            seshs.save(sesh);
        }
    }

    //DELETE A SESSION
    @RequestMapping(path = "/sesh/{id}", method = RequestMethod.DELETE)
    public void deleteSesh (@PathVariable("id") int id) {
        seshs.delete(seshs.findOne(id));
    }

    /**
     * This will remove two Friend objects: the original and its reciprocal.
     * @param id : "id" of user being removed
     * @param session : logged in user
     */
    //REMOVE SOMEONE FROM FRIENDS LIST
    @RequestMapping(path = "/friend/{id}", method = RequestMethod.DELETE)
    public void removeFriend (@PathVariable("id") int id, HttpSession session) {
        User loggedInUser = getUserFromSession(session);
        User friendToRemove = users.findOne(id);
        Friend friend = friends.findFirstByRequesterAndApprover(loggedInUser, friendToRemove);
        Friend friend2 = friends.findFirstByRequesterAndApprover(friendToRemove, loggedInUser);
        friends.delete(friend);
        friends.delete(friend2);

        //creates a list of join objects created by the user being removed
        List<Join> joinsFromRemovedFriend = joins.findAllByUser(friendToRemove);
        if (joinsFromRemovedFriend != null) {
            for (Join j : joinsFromRemovedFriend) {

                //in other words, if this person joined one of your sesh's (via a join object), the corresponding
                // join object will be deleted as well
                if (j.getSesh().getUser().getId() == loggedInUser.getId()) {
                    joins.delete(j);
                }
            }
        }
    }

    //DENY FRIEND REQUEST (THE ID = FRIENDING USER ID)
    @RequestMapping(path = "/deny/{id}", method = RequestMethod.DELETE)
    public void denyFriendRequest (@PathVariable("id") int id, HttpSession session) {
        User loggedIn = getUserFromSession(session);
        User requester = users.findOne(id);
        Friend friend = friends.findFirstByRequesterAndApprover(requester, loggedIn);
        friends.delete(friend);
    }

    /**
     * Methods from refactoring:
     */

    public User getUserFromSession(HttpSession session) {
        return users.findByUsername((String) session.getAttribute("username"));
    }

    public List<User> returnList (User user, List<Friend> allList) {
        return allList.parallelStream()
                .filter(Friend::getIsApproved)
                .map(friend -> {
                    if (friend.getRequester().getId() == user.getId()) {
                        return friend.getApprover();
                    }
                    else if (friend.getApprover().getId() == user.getId()) {
                        return friend.getRequester();
                    }
                    else return null;
                })
                .collect(Collectors.toCollection(ArrayList<User>::new));
    }

}
