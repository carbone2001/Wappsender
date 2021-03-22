<?php
// { data: { reason: "...", notification: { number:"+54..." , message: "..." } } }
$data = json_decode($_POST['data']);

switch($data->reason)
{
    case 'connect':
        echo 'connected';
    break;
    case 'check':
        $notificationsFile = fopen("pending_notifications.json", "r") or die("Read Error!");
        echo fread($notificationsFile,filesize("pending_notifications.json"));
        fclose($notificationsFile);
    break;
    case 'add':
        $notificationsFile = fopen("pending_notifications.json", "r") or die("Read Error!");
        $notifications = json_decode(fread($notificationsFile,filesize("pending_notifications.json")));
        if($data->notification != null)
        {
            if($notifications == null)
            {
                $notifications = json_decode("[]");
            }
            array_push($notifications,$data->notification);
            $notificationsFile = fopen("pending_notifications.json", "w") or die("Write Error!");
            fwrite($notificationsFile,json_encode($notifications));
            fclose($notificationsFile);
            echo "Notification has been added succesfully";
        }
        else
        {
            echo "Cannot add a null notification";
        }
    break;
    case 'remove':
        $notificationsFile = fopen("pending_notifications.json", "r") or die("Read Error!");
        $notifications = json_decode(fread($notificationsFile,filesize("pending_notifications.json")));
        fclose($notificationsFile);
        if($data->notification != null)
        {
            if($data->notification->number != null)
            {
                $newNotifications = json_decode("[]");
                foreach($notifications as $value)
                {
                    
                    if(strcmp($value->number,$data->notification->number) != 0)
                    {
                        array_push($newNotifications, $value);
                    }
                }
                $notifications = $newNotifications;
                // $notifications = array_filter($notifications,function($var) {
                //     $data = json_decode($_POST['data']);
                //     return strcmp($var->number,$data->notification->number) != 0;
                // });
                $notificationsFile = fopen("pending_notifications.json", "w") or die("Write Error!");
                fwrite($notificationsFile,json_encode($notifications));
                fclose($notificationsFile);
                echo "Notification has been removed succesfully";
            }
            else
            {
                echo "Cannot remove a null number notification";
            }
        }
        else
        {
            echo "Cannot remove a null notification";
        }
    break;
    case "test":
        echo var_dump(json_decode("[]"));
    break;
    default:
        echo 'Uknown Reason';
    break;
}

